import React, { Component } from 'react';
import Draggable from 'react-draggable';

export default class ChatBox extends Component {
  constructor(props) {
    super(props);

    if (typeof(sessionStorage) !== 'undefined' &&
        sessionStorage.getItem('chat_bot_state') !== null)
    {
      this.state = JSON.parse(sessionStorage.getItem('chat_bot_state'));
    } else {
      this.state = {
        messages: [],
        newMessage: '',
        context: null,
        minimized: false
      };
    }

    if (typeof(sessionStorage) !== 'undefined' &&
        sessionStorage.getItem('chat_bot_position') !== null)
    {
      this.defaultPosition = JSON.parse(sessionStorage.getItem('chat_bot_position'));
    } else {
      this.defaultPosition = this.props.defaultPosition || {bottom: 10, right: 10};
    }
  }

  componentDidMount(props) {
    // If conversation already exists, scroll to bottom, otherwise start conversation.
    if (this.state.messages.length === 0) {
      this.sendMessage();
    } else if (!this.state.minimized) {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (typeof(sessionStorage) !== 'undefined') {
      sessionStorage.setItem('chat_bot_state', JSON.stringify(this.state))
    }

    // Ensure that chat box stays scrolled to bottom
    if (!this.state.minimized) {
      if (prevState.messages.length !== this.state.messages.length) {
        jQuery(this.messageList).stop().animate({scrollTop: this.messageList.scrollHeight});
      } else if (prevState.minimized != this.state.minimized) {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }
    }
  }

  toggleMinimize() {
    this.setState({minimized: !this.state.minimized});
  }

  submitMessage(e) {
    e.preventDefault();

    if (this.state.newMessage === '') {
      return false;
    }

    this.sendMessage();
    this.setState({
      newMessage: '',
      messages: this.state.messages.concat({from: 'user', text: this.state.newMessage})
    });
  }

  sendMessage() {
    fetch('/wp-json/watsonconv/v1/message', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        input: {text: this.state.newMessage},
        context: this.state.context
      })
    }).then(response => {
      return response.json();
    }).then(body => {
      this.setState({
        context: body.context,
        messages: this.state.messages.concat({from: 'watson', text: body.output.text})
      });
    }).catch(error => {
      console.log(error);
    })
  }

  setMessage(e) {
    this.setState({newMessage: e.target.value});
  }

  savePosition(e, data) {
    let {bottom, right} = data.node.getBoundingClientRect();
    sessionStorage.setItem('chat_bot_position', JSON.stringify({
      bottom: (1 - bottom / window.innerHeight) * 100,
      right: (1 - right / window.innerWidth) * 100
    }));
  }

  renderMessage(message, index) {
    return (
      <div
        key={`message${index}`}
        className={`popup-message ${message.from}-message`}
      >
        {message.text}
      </div>
    );
  }

  render() {
    let {bottom, right} = this.defaultPosition;

    return (
      <Draggable handle='.popup-head' onStop={this.savePosition}>
      <span
        style={{bottom: `${bottom}%`, right: `${right}%`}}
        className='popup-box-wrapper'
      >
        <div className='popup-box'>
          <div className='popup-head'>
            Watson
            <span className='dashicons dashicons-no-alt popup-control'
              onClick={this.props.closeChat}></span>
            <span className={`dashicons
              dashicons-arrow-${this.state.minimized ? 'up' : 'down'}-alt2
              popup-control`}
              onClick={this.toggleMinimize.bind(this)}></span>
          </div>
          {!this.state.minimized && <div>
            <div className='popup-messages' ref={div => {this.messageList = div}}>
              {this.state.messages.map(this.renderMessage)}
            </div>
            <form onSubmit={this.submitMessage.bind(this)} className='popup-message-form'>
              <input
                className='popup-message-input'
                type='text'
                placeholder='Type a message'
                value={this.state.newMessage}
                onChange={this.setMessage.bind(this)}
              />
            </form>
          </div>}
        </div>
      </span>
      </Draggable>
    );
  }
}