import React from 'react';
import gitlabLogo from '../../assets/images/gitlab-logo-700.svg';
import shareIcon from '../../assets/images/share.svg';
import './index.scss';


const Footer = () => {
  const share = () => {
    navigator.share({
      url: 'https://maiz.uno',
      title: 'MAÍZ',
      text: 'Hands Down the Best 3D Corn Maze on the Internet.',
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
        <button
          type="button"
          className="share"
          onClick={share}
        >
          <img
            className="share"
            alt="share icon"
            src={shareIcon}
          />
        </button>
        <a
          href="https://gitlab.com/daveseidman/maiz"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="gitlab"
            alt="github logo"
            src={gitlabLogo}
          />
        </a>
      </div>
    </div>
  );
};

export default Footer;
