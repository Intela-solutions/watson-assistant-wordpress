/* global jQuery */

import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip-currenttarget';
import webrtc from 'webrtcsupport';
import jstz from 'jstz';
import merge from "deepmerge";

import MessageGroup from './MessageGroup';
import InputBox from './InputBox.jsx';
import CallInterface from './CallInterface.jsx';

import 'whatwg-fetch';

export default class ChatBox extends Component {
    constructor(props) {
        super(props);

        if (typeof(localStorage) !== 'undefined' && localStorage.getItem('watson_bot_state')) {
            this.loadStateFromStorage();
        } else {
            this.state = {
                messages: [],
                context: {},
                showCallInterface: false,
                mediaSecure: true,
                convStarted: false
            };
            if(watsonconvSettings.typingDelayFromPlugin !== 'no') {
                this.state.indexTypingMessage = [];
            }
        }
        this.state.context = merge(
            this.state.context,
            this.getInitialContext()
        );

        this.loadedMessages = this.state.messages.length;
    }

    getInitialContext() {
        return merge(
            watsonconvSettings.context,
            {
                global: {
                    system: {
                        timezone: jstz.determine().name()
                    }
                }
            }
        );
    }

    loadStateFromStorage() {
        let watsonBotState = JSON.parse(localStorage.getItem('watson_bot_state'));
        if(watsonconvSettings.clearChat === 'yes') {
            watsonBotState.messages.splice(1);
        }

        this.state = watsonBotState;
        if (!this.state.context) {
            this.state.context = {};
        }
    }

    componentDidMount() {
        // If conversation already exists, scroll to bottom, otherwise start conversation.
        if (typeof(this.messageList) !== 'undefined') {
            this.scrollToBottom();
            // this.messageList.scrollTop = this.messageList.scrollHeight;
        }

        if (!this.state.convStarted && !this.props.isMinimized) {
            this.sendMessage();
        }

        if (webrtc.support && 'https:' !== document.location.protocol) {
            navigator.mediaDevices.getUserMedia({video: {width: {min: 2, max: 1}}})
                .then(stream => {
                    console.log("getUserMedia detection failed");
                    stream.getTracks().forEach(t => t.stop());
                })
                .catch(e => {
                    switch (e.name) {
                        case "NotSupportedError":
                        case "NotAllowedError":
                        case "SecurityError":
                            console.log("Can't access microphone in http");
                            this.setState({mediaSecure: false});
                            break;
                        case "OverconstrainedError":
                        default:
                            break;
                    }
                });
        }

        window.addEventListener('storage', function(e) {
            if(e.key === 'watson_bot_state') {
                this.loadStateFromStorage();
                this.setState(this.state);
                this.scrollToBottom();
            };
        }.bind(this));

        // Fixed out of screen input field on mobile Chrome
        const headerHeight = jQuery('#watson-header').outerHeight();
        jQuery('#chatbox-body').css({'height': 'calc(100% - ' + headerHeight + 'px)'});
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.convStarted && !this.props.isMinimized) {
            this.sendMessage();
        }

        if (prevState.messages.length !== this.state.messages.length) {
            // Ensure that chat box stays scrolled to bottom
            if (typeof(this.messageList) !== 'undefined') {
                this.scrollToBottom()
            }
        }
        if (watsonconvSettings.typingDelayFromPlugin !== 'no' && this.state.messages.length === 0 && this.state.convStarted && !this.props.isMinimized) {
            this.watsonTyping(watsonconvSettings.typingDelayFromPlugin);
        }
    }

    toggleCallInterface() {
        this.setState({showCallInterface: !this.state.showCallInterface});
    }

    scrollToBottom() {
        jQuery(this.messageList).stop().animate({scrollTop: this.messageList.scrollHeight});
    }

    sendMessage(message, fullBody = false) {
        if (!this.state.convStarted) {
            this.setState({convStarted: true});
        }

        let sendBody;

        if (fullBody) {
            sendBody = message;

            if (typeof sendBody.context === 'object') {
                sendBody.context = merge(this.state.context, sendBody.context);
            } else {
                sendBody.context = this.state.context;
            }
        } else {
            sendBody = {
                input: {text: message},
                context: this.state.context
            };
        }
        if (sendBody.input) {
            sendBody.input = merge(sendBody.input, {
                options: {
                    return_context: true
                }
            });
        }
        sendBody.session_id = this.state.session_id;
        let waitingIBMResponse = watsonconvSettings.typingDelayFromPlugin === 'waiting_ibm_response';
        let typingDelayFromPlugin = watsonconvSettings.typingDelayFromPlugin === 'yes';

        fetch(watsonconvSettings.apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': watsonconvSettings.nonce
            },
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify(sendBody)
        }).then(response => {
            if (!response.ok) {
                throw Error('Message could not be sent.');
            }
            return response.json();
        }).then(body => {
            let {generic} = body.output;
            let pauseIndex = generic.findIndex(
                item => item.response_type === 'pause'
            );
            let state = {
                context: body.context,
                session_id: body.session_id
            };

            if (waitingIBMResponse) {
                this.stopWatsonTyping();
                if (pauseIndex !== -1) {
                    generic.splice(pauseIndex, 1);
                }
            }

            if (typingDelayFromPlugin) {
                if (pauseIndex !== -1) {
                    generic.splice(pauseIndex, 1);
                }
                let { messages, indexTypingMessage } = this.state;

                messages[indexTypingMessage[0]].content = messages[indexTypingMessage[0]].content.concat(generic);
                messages[indexTypingMessage[0]].options = body.output.options;
                indexTypingMessage.shift();
                state.messages = messages;
                state.indexTypingMessage = indexTypingMessage;
            } else {
                state.messages = this.state.messages.concat({
                        from: 'watson',
                        content: generic,
                        options: body.output.options
                    });
                state.session_id = body.session_id;
            }

            this.setState(state, this.saveState.bind(this));

        }).catch(error => {
            console.log(error);

            if (watsonconvSettings.messageAfterError.length > 0) {
                this.setState({
                    messages: this.state.messages.concat({
                        from: 'watson',
                        content: [
                            {
                                response_type: 'text',
                                text: watsonconvSettings.messageAfterError
                            }
                        ]
                    })
                });
            }

            if (waitingIBMResponse) {
                this.stopWatsonTyping();
            }
        });

        if (message) {
            this.setState({
                messages: this.state.messages.concat({
                    from: 'user',
                    text: fullBody ? message.input.text : message
                })
            });
        }

        if ((waitingIBMResponse || typingDelayFromPlugin) && this.state.messages.length > 0) {
            this.watsonTyping(watsonconvSettings.typingDelayFromPlugin);
        }
    }

    reset() {
        let resetState = {
            messages: [],
            context: this.getInitialContext(),
            session_id: null
        };

        if(watsonconvSettings.typingDelayFromPlugin !== 'no') {
            resetState.indexTypingMessage = [];
        }

        this.setState(resetState);

        this.sendMessage();

        this.loadedMessages = this.state.messages.length;
    }

    saveState() {
        if (typeof(localStorage) !== 'undefined') {
            localStorage.setItem('watson_bot_state', JSON.stringify(this.state))
        }
    }

    watsonTyping(typingType) {
        let typing = {
            from: 'watson',
            content: [
                {
                    typing: true,
                    response_type: 'pause'
                }
            ],
        };
        let indexTypingMessage = this.state.messages.length;

        if (typingType === 'yes') {
            typing.content[0].time = watsonconvSettings.typingDelayTime;
        } else {
            typing.content[0].time = watsonconvSettings.typingMaxWaitingtime;
            typing.waitingIBMResponse = false;
        }


        this.setState({
            messages: this.state.messages.concat(typing),
            indexTypingMessage: [...this.state.indexTypingMessage, indexTypingMessage]
        });
    }

    stopWatsonTyping() {
        let { messages, indexTypingMessage } = this.state;
        messages[indexTypingMessage[0]].waitingIBMResponse = true;
        indexTypingMessage.shift();
        this.setState({
            messages,
            indexTypingMessage: indexTypingMessage
        });
    }

    fullscreenEmbeddedChatboxOnMobile(e) {
        let watsonBox = jQuery('#watson-box');
        let embeddedChatbox = watsonBox.parent().attr('id') === 'watsonconv-inline-box';
        let isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && embeddedChatbox) {
            watsonBox.css({'height': '100%', 'width': '100%'});
            watsonBox.parent().addClass('embedded-watsonconv-on-ios');
            this.setState({
                isFullScreen: true,
                showMinimizeButton: true
            });
        }
    }

    minimizeEmbeddedChatboxOnMobile(e) {
        jQuery('#watson-box').css({'height': '', 'width': ''});
        jQuery('#watson-box').parent().removeClass('embedded-watsonconv-on-ios');
        this.setState({
            isFullScreen: false,
            showMinimizeButton: false
        });
    }

    render() {
        let {callConfig, clearText} = watsonconvSettings;

        let position = watsonconvSettings.position || ['bottom', 'right'];

        let showCallInterface = this.state.showCallInterface;
        let allowTwilio = callConfig.useTwilio == 'yes'
            && callConfig.configured
            && webrtc.support
            && this.state.mediaSecure;

        let hasNumber = Boolean(callConfig.recipient);
        let showMinimizeButton = this.state.showMinimizeButton;

        return (
            <div id='watson-box' className='drop-shadow animated'>
                <div
                    id='watson-header'
                    className='watson-font'
                >
          <span
              className={`dashicons
              dashicons-arrow-${position[0] == 'bottom' ? 'down' : 'up'}-alt2
              header-button minimize-button`}
              onClick={this.props.toggleMinimize}
          ></span>
          {showMinimizeButton &&
            <span
                className={`dashicons
                dashicons-arrow-down-alt2
                header-button`}
                onClick={this.minimizeEmbeddedChatboxOnMobile.bind(this)}
            ></span>
          }
                    <span
                        onClick={this.reset.bind(this)}
                        className={`dashicons dashicons-trash header-button`}
                        data-tip={clearText || 'Clear Messages'}
                        data-for='header-button-tooltip'>
          </span>
                    {hasNumber &&
                    <span
                        onClick={this.toggleCallInterface.bind(this)}
                        className={`dashicons dashicons-phone header-button`}
                        data-tip={callConfig.callTooltip || 'Talk to a Live Agent'}
                        data-for='header-button-tooltip'>
            </span>
                    }
                    <ReactTooltip id='header-button-tooltip'/>
                    <div className='overflow-hidden watson-font'>{watsonconvSettings.title}</div>
                    <div className='chatbox-logo'></div>
                </div>
                <div id="chatbox-body"
                     onClick={!this.state.isFullScreen ? this.fullscreenEmbeddedChatboxOnMobile.bind(this) : ''}
                >
                    {hasNumber && showCallInterface &&
                    <CallInterface allowTwilio={allowTwilio}
                                   toggleCallInterface={this.toggleCallInterface.bind(this)}
                    />}
                    <div id='message-container'>
                        <div id='messages' ref={div => {
                            this.messageList = div
                        }}>
                            {this.state.messages.map(
                                (message, index) =>
                                    <MessageGroup
                                        {...message}
                                        key={index}
                                        index={index}
                                        showPauses={index >= this.loadedMessages}
                                        sendMessage={this.sendMessage.bind(this)}
                                        scroll={this.scrollToBottom.bind(this)}
                                    />
                            )}
                        </div>
                    </div>
                    <InputBox
                        sendMessage={this.sendMessage.bind(this)}
                        fullscreenEmbeddedChatbox={this.fullscreenEmbeddedChatboxOnMobile.bind(this)}
                    />
                </div>
            </div>
        );
    }
}
