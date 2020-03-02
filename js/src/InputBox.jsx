/* global jQuery */
import React, { Component } from 'react';

export default class InputBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      pageScrolling: true,
      scrollPosition: 0
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

      if (jQuery.browser.safari && navigator.userAgent.match(/(iPod|iPhone)/) && jQuery(window).innerWidth() < 640) {
          const innerHeight = window.innerHeight;
          let watsonBox = jQuery('#watson-box');
          let embeddedChatbox = watsonBox.parent().attr('id') === 'watsonconv-inline-box';
          if (embeddedChatbox) {
              this.props.fullscreenEmbeddedChatbox();
          }


          this.setState({
              pageScrolling: false,
              scrollPosition: jQuery(window).scrollTop()
          });

          setTimeout(() => {
              const distanceHeaderToTop = Math.abs(jQuery('#watson-header').offset().top - jQuery(window).scrollTop());
              const windowInnerHeight = innerHeight - distanceHeaderToTop;
              const newChatBoxHeight = windowInnerHeight * 100 / innerHeight;

              watsonBox.css({'height': newChatBoxHeight + '%'});
              jQuery('body').addClass('show-chatbox');
              jQuery(window).scrollTop(0);
          }, 500);
      }
      setTimeout(() => {
          jQuery('#messages').stop().animate({scrollTop:jQuery('#messages').prop("scrollHeight")}, 1000);
      }, 1000);
  }

  onBlur(e) {
       jQuery('#watson-box').css({'height': '100%'});

       this.setState({
           pageScrolling: true
       });

       jQuery('body').removeClass('show-chatbox');

       if (this.state.scrollPosition > 0) {
           setTimeout(() => {
               jQuery(window).scrollTop(this.state.scrollPosition);
           }, 100);
       }
  }

  touchendChatBox() {
      if (!this.state.pageScrolling) {
          let distanceHeaderToTop = jQuery('#watson-header').offset().top - jQuery(window).scrollTop();
          if (distanceHeaderToTop < 0) {
              jQuery(window).scrollTop(0);
          }
      }
  }

  componentDidMount() {
      jQuery('#watson-box').on('touchend', this.touchendChatBox.bind(this));
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