import React from 'react';
import { RWebShare } from 'react-web-share';
// import gitlabLogo from '../../assets/images/gitlab-logo-700.svg';
import sourceCodeLogo from '../../assets/images/code.svg';
// import shareIcon from '../../assets/images/share.svg';
import { metadata } from '../../assets/content.json';
import './index.scss';


const Footer = () => {
  const { title, text, url } = metadata;

  const share = () => {
    navigator.share({
      url: 'https://maiz.uno',
      title: 'MAÍZ',
      text: description,
    });
  };
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
          <button>Share</button>
        </RWebShare>
        <a
          href="https://gitlab.com/daveseidman/maiz"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="gitlab"
            alt="source code logo"
            src={sourceCodeLogo}
          />
        </a>
      </div>

    </div>
  );
};

export default Footer;
