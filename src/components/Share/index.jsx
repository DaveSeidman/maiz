import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  EmailShareButton, EmailIcon,
  FacebookShareButton, FacebookIcon,
  LinkedinShareButton, LinkedinIcon,
  RedditShareButton, RedditIcon,
  TwitterShareButton, TwitterIcon,
} from 'react-share';
import copyIcon from '../../assets/images/copy-icon.svg';
import logo from '../../assets/images/maiz-logo.png';
import { metadata } from '../../assets/content.json';

import './index.scss';

function Share(props) {
  const { share, setShare } = props;
  const clipboardMessage = useRef();

  const copyToClipboard = () => {
    console.log('copy');
    navigator.clipboard.writeText(metadata.url).then((error) => {
      console.log('done', error);
      clipboardMessage.current.classList.remove('hidden');
      setTimeout(() => {
        clipboardMessage.current.classList.add('hidden');
      }, 2000);
    });
  };

  const platforms = [
    {
      name: 'Twitter',
      button: <TwitterShareButton url={metadata.url} title={metadata.title} hashtags={metadata.hashtags}><TwitterIcon /></TwitterShareButton>,
    },
    {
      name: 'Facebook',
      button: <FacebookShareButton url={metadata.url} quote={metadata.title} hashtag={metadata.hashtags.join(',')}><FacebookIcon /></FacebookShareButton>,
    },
    {
      name: 'LinkedIn',
      button: <LinkedinShareButton url={metadata.url} title={metadata.title} description={metadata.title} source={metadata.url}><LinkedinIcon /></LinkedinShareButton>,
    },
    {
      name: 'Reddit',
      button: <RedditShareButton url={metadata.url} title={metadata.title}><RedditIcon /></RedditShareButton>,
    },
    {
      name: 'Email',
      button: <EmailShareButton url={metadata.url} subject={metadata.title} body={metadata.body}>  <EmailIcon /> </EmailShareButton>,
    },
    {
      name: 'Copy',
      button: <button type="button" onClick={copyToClipboard}> <img alt="copy icon" src={copyIcon} /></button>,
    },
  ];

  return (
    <div
      className={`share modal ${share ? '' : 'hidden'}`}
      onClick={({ target }) => {
        if (target.classList.contains('share')) setShare(false);
      }}
    >
      <div className="share-content modal-content">
        <div className="share-content-title">
          <div className="share-content-title-logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="share-content-title-text">
            <h2>MAIZ 🌽</h2>
            <h3><a onClick={copyToClipboard} target="_blank" rel="noreferrer">https://maiz.com</a></h3>
          </div>
        </div>
        <div className="share-content-platforms">
          {
            platforms.map((platform) => (
              <span className="share-content-platforms-platform">
                {platform.button}
              </span>
            ))
          }
        </div>
        <span
          ref={clipboardMessage}
          className="share-content-clipboard hidden"
        >link copied to your clipboard
        </span>
        <button
          className="share-content-close"
          type="button"
          onClick={() => { setShare(false); }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Share;

Share.propTypes = {
  share: PropTypes.bool,
  setShare: PropTypes.func,
};

Share.defaultProps = {
  share: false,
  setShare: () => { },
};
