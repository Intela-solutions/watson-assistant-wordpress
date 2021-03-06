/* global Twilio */

import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip-currenttarget';

export default class CallInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calling: false,
      log: 'Connecting...',
      hasToken: false
    };
  }

  connect() {
    this.setState({
      onPhone: true
    })

    Twilio.Device.connect();
    this.setState({log: this.props.callConfig.callingText || 'Calling Agent...'})
  }

  disconnect() {
    Twilio.Device.disconnectAll();
    this.setState({log: 'Call ended.'});
  }

  startCall() {
    this.setState({
      calling: true
    });

    if (!this.state.hasToken) {
      fetch('?rest_route=/watsonconv/v1/twilio-token', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      }).then(response => {
        if (!response.ok) {
            throw Error('Unable to fetch token.');
        }
        return response.json();
      }).then(body => {
        Twilio.Device.setup(body.token);
      }).catch(error => {
        console.log(error);
        this.setState({log: 'Call failed.'});
        setTimeout(this.endCall.bind(this), 1000);
      });

      Twilio.Device.disconnect(() =>{
        this.setState({
          onPhone: false,
          log: 'Call ended.'
        });
        setTimeout(this.endCall.bind(this), 1000);
      });

      Twilio.Device.ready(() => {
        this.setState({hasToken: true});
        this.connect();
      });
    } else {
      this.connect();
    }
  }

  endCall() {
    this.setState({calling: false});
  }

  callRecipient() {
      let { recipient } = watsonconvSettings.callConfig;
      document.location.href =  'tel:' + recipient;
  }

  toggleCallInterface() {
      if (typeof this.props.toggleCallInterface === 'function') {
          this.props.toggleCallInterface();
      }
  }

  render({allowTwilio}, {calling, log}) {
    let { callButton, recipient } = watsonconvSettings.callConfig;

    return <span id='call-interface'>
        {calling ? 
          <div id='controls'>
            <p>{log}</p>
            <button onClick={this.disconnect.bind(this)}>Hang Up</button>
          </div> 
          :
          <div id='controls'>
            <p style={{'line-height': '2.7em'}}>
              Dial <a href={`tel:${recipient}`}>{recipient}</a>
            </p>
            <div>
              <span
                  onClick={this.callRecipient.bind(this)}
                  className={`dashicons dashicons-phone call-interface-button`}
                  data-tip='Dial'
                  data-for='call-interface-button-tooltip'>
              </span>
              <span
                    onClick={this.toggleCallInterface.bind(this)}
                    className={`dashicons dashicons-format-chat call-interface-button`}
                    data-tip='Back to chat'
                    data-for='call-interface-button-tooltip'>
              </span>
              <ReactTooltip id='call-interface-button-tooltip'/>
            </div>

            {allowTwilio && <div>
              <p>
                or
              </p>
              <button onClick={this.startCall.bind(this)}>
                {callButton || 'Start Toll-Free Call Here'}
              </button>
            </div>}
          </div>
        }
      </span>
  }
}