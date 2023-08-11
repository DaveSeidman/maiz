import React from 'react';
import gitlabLogo from '../../assets/images/gitlab-logo-700.svg';
import './index.scss';

const Footer = () => (
  <div className="footer">
    <p>A Digital Stunt by <a href="http://daveseidman.com" target="_blank" rel="noreferrer">Dave Seidman</a></p>
    <a href="https://gitlab.com/daveseidman/maiz" target="_blank" rel="noreferrer"><img className="gitlab" alt="github logo" src={gitlabLogo} /></a>
  </div>
);

export default Footer;
