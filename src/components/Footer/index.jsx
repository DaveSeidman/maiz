import React from 'react';
import { RWebShare } from 'react-web-share';
import shareIcon from '../../assets/images/share.svg';
import { metadata } from '../../assets/content.json';
import './index.scss';

function Footer() {
  const { title, text, url } = metadata;

  return (
    <div className="footer">
      <div className="left">
        <p>A Digital Stunt by
          <a
            href="http://daveseidman.com"
            target="_blank"
            rel="noreferrer"
          >
            Dave Seidman
          </a>
        </p>
      </div>
      <div className="right">
        <RWebShare
          data={{ text, url, title }}
          sites={['twitter', 'facebook', 'linkedin', 'reddit', 'mail', 'copy']}
          onClick={() => console.log('shared successfully!')}
        >
          <button type="button">
            Share
            <img
              className="share"
              alt="share icon"
              src={shareIcon}
            />
          </button>
        </RWebShare>
      </div>
    </div>
  );
}

export default Footer;
