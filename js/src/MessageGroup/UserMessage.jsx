import React, { Component } from 'react';
import DOMPurify from 'dompurify';

export default class UserMessage extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render({from, text}) {
    return <div>
      <div
        className={`message ${from}-message watson-font`}
        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(text)}}
      ></div>
    </div>;
  }
}
