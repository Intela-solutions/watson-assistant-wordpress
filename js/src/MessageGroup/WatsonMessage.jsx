import React, { Component } from 'react';
import Autolinker from 'autolinker';
import DOMPurify from 'dompurify';

export default class WatsonMessage extends Component {
  constructor(props) {
    super(props);

    let { content } = props;

    if (props.showPauses) {
      let i = content.findIndex(
        item => item.response_type === 'pause'
      );
  
      this.state = {
        currentIndex: (i === -1) ? content.length : i,
        typing: (i === -1) ? false : content[i].typing
      };
    } else {
      this.state = {
        currentIndex: content.length,
        typing: false
      };
    }
  }

  componentDidMount() {
    this.nextPause();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.currentIndex !== this.state.currentIndex;
  }

  componentDidUpdate(prevProps) {
    this.props.scroll();
    this.nextPause();
  }

  nextPause() {
    let { content } = this.props;
    let { currentIndex } = this.state;

    if (currentIndex < content.length) {
      let i = content.findIndex(
        (item, index) => index > currentIndex && item.response_type === 'pause'
      );

      setTimeout(() => {
        this.setState({
          currentIndex: (i === -1) ? content.length : i,
          typing: (i === -1) ? false : content[i].typing
        });
      }, content[currentIndex].time);
    }
  }

  escapeAnchorTag(text) {
    let clearText = DOMPurify.sanitize(text, {ADD_ATTR: ['target']});
    let textParse = Autolinker.parse( clearText, {
      urls: true,
        email: true
    } );

    textParse.map((link) => {
      if(link.getType() === 'url') {
        let url = link.getUrl();
        let urlObj = new URL(url);
        let urlHash = urlObj.hash;
        let codedHash = '&amp;__hash__;';

        if(urlHash) {
          clearText = clearText.replace(decodeURIComponent(urlHash), 'false');
        }

        if(url.indexOf(codedHash) !== -1) {
          clearText = clearText.replace(codedHash, '#');
        }
      }
    });

    let linkedText = Autolinker.link(clearText);
    return linkedText;
  }

  render({sendMessage, from, content, options}, { typing, currentIndex }) {
    let response = [], legacyOptions = true;

    for (let i = 0; i < currentIndex; i++) {
      switch(content[i].response_type) {

        case 'option':
          legacyOptions = false;

          if (content[i].title || content[i].description) {
            response.push(
              <div
                key={response.length}
                className={`message ${from}-message watson-font`}
              >
                <strong>{content[i].title}</strong>
                <p>{content[i].description}</p>
              </div>
            );
          }

          response.push(...content[i].options.map(
            (option, index) => (
              <div
                key={response.length + index} className={`message message-option watson-font`}
                onClick={() => { sendMessage(option.value, true); }}
              >
                {option.label}
              </div>
            )
          ));

          break;

          case 'suggestion':

              if (content[i].title) {
                  response.push(
                      <div
                          key={response.length}
                          className={`message ${from}-message watson-font`}
                      >
                          <strong>{content[i].title}</strong>
                      </div>
                  );
              }

              response.push(...content[i].suggestions.map(
                  (suggestion, index) => (
                      <div
                          key={response.length + index} className={`message message-option watson-font`}
                          onClick={() => { sendMessage(suggestion.value, true); }}
                      >
                          {suggestion.label}
                      </div>
                  )
              ));
              break;

        case 'text':
          response.push(
            <div
              key={response.length}
              className={`message ${from}-message watson-font`}
              dangerouslySetInnerHTML={{__html: this.escapeAnchorTag(content[i].text)}}
            ></div>
          );
          break;

        case 'image':
          response.push(
            <div
              key={response.length}
              className={`message ${from}-message watson-font`}
            >
              <span dangerouslySetInnerHTML={{__html: this.escapeAnchorTag(content[i].title)}}></span>
              <img src={content[i].source} title={content[i].description}></img>
            </div>
          );
          break;


        case 'search':
           response.push(
             <div
               key={response.length}
               className={`message ${from}-message watson-font`}
             >
                 <strong>{content[i].header}</strong>
             </div>
           );

           response.push(...content[i].results.map(
               (result, index) => (
                   <div key={response.length + index} className={`message ${from}-message-search watson-font`}>
                       <strong dangerouslySetInnerHTML={{__html: Autolinker.link(DOMPurify.sanitize(result.title))}}></strong>
                       <p dangerouslySetInnerHTML={{__html: Autolinker.link(DOMPurify.sanitize(result.highlight.text[0]))}}></p>
                       {
                           result.url ? <a href={result.url} target={`_blank`} className={`watson-search-link`}></a> : null
                       }
                   </div>
               )
          ));
          break;

      }
    }

    if (typing) {
      response.push(
        <div key={response.length} className='message watson-message watson-font'>
          <div class='typing-dot'>
          </div><div class='typing-dot'>
          </div><div class='typing-dot'>
          </div>
        </div>
      );
    }

    // Legacy options buttons
    if (legacyOptions && currentIndex >= content.length && Array.isArray(options)) {
      response.push(...options.map((option, index) => (
        <div 
          key={response.length + index} className={`message message-option watson-font`} 
          onClick={() => { sendMessage(option); }}
        >
          {option}
        </div>
      )));
    }
      
    return <div>
      {response}
    </div>;
  }
}
