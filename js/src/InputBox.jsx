/* global jQuery */
import React, { Component } from 'react';

export default class InputBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: ''
    };
  }

  setMessage(e) {
    this.setState({message: e.target.value});
  }

  submitMessage(e) {
    e.preventDefault();

    if (this.state.message === '') {
      return false;
    }

    this.props.sendMessage(this.state.message);

    this.setState({
      message: ''
    });
  }

  onFocus(e) {
    if (jQuery.browser.safari) {
      setTimeout(() => {
        let currentscroll = jQuery(window).scrollTop();
        let widgetHeight = (window.innerHeight - currentscroll) * 2;
        jQuery('#watson-box').css({'height': 'calc(' + widgetHeight + 'px - 50px)'});
        window.scrollTo(0, 0);
        }, 500);
    }
      setTimeout(() => {
          jQuery('#messages').stop().animate({scrollTop:jQuery('#messages').prop("scrollHeight")}, 1000);
      }, 1000);
  }

  onBlur(e) {
    jQuery('#watson-box').css({'height': '100%'});
  }

  render() {
    let showSendBtn = (watsonconvSettings.showSendBtn === 'yes');
    let { messagePrompt } = watsonconvSettings;

    return (
      <form action='' className='message-form watson-font' onSubmit={this.submitMessage.bind(this)}>
        <input
          className='message-input watson-font'
          type='text'
          placeholder={messagePrompt}
          value={this.state.message}
          onChange={this.setMessage.bind(this)}
          onFocus={this.onFocus.bind(this)}
          onBlur={this.onBlur.bind(this)}
        />
        {showSendBtn && 
          <button type='submit' id='message-send'>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 48 48" 
                fill="white"
              >
                <path d="M4.02 42L46 24 4.02 6 4 20l30 4-30 4z"/>
              </svg>
            </div>
          </button>
        }
      </form>
    );
  }
}