import React from 'react';
import shareIcon from '../../assets/images/share.svg';
import { metadata } from '../../assets/content.json';
import './index.scss';

function Footer(props) {
  const { title, text, url } = metadata;
  const { setShare } = props;

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
        <button
          type="button"
          onClick={() => { setShare(true); }}
        >
          Share
          <img
            className="share"
            alt="share icon"
            src={shareIcon}
          />
        </button>
      </div>
    </div>
  );
}

export default Footer;
