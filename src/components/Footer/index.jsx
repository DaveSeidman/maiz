import React from 'react';
import PropTypes from 'prop-types';
import shareIcon from '../../assets/images/share.svg';
import './index.scss';

function Footer(props) {
  const { setShareHandler } = props;

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
          onClick={() => { setShareHandler(true); }}
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

Footer.propTypes = {
  setShareHandler: PropTypes.func,
};

Footer.defaultProps = {
  setShareHandler: () => { },
};
