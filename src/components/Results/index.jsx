// TODO: rerendering with timer
import React from 'react';
import cornImage from '../../assets/images/corn.png';

import './index.scss';
// import {
//   EmailShareButton, EmailIcon,
//   FacebookShareButton, FacebookIcon,
//   LinkedinShareButton, LinkedinIcon,
//   RedditShareButton, RedditIcon,
//   TwitterShareButton, TwitterIcon,
// } from 'react-share';
import { messages } from '../../assets/content.json';
import { gameDuration } from '../../config';
import PropTypes from 'prop-types';

// const random = array => array[Math.floor(Math.random() * array.length)];

const Results = (props) => {
  const { results, playAgain, timer, popCount, kernals } = props;
  const index = Math.floor(Math.random() * messages.won.length);
  const message = messages[results.win ? 'won' : 'lost'][index];

  const percentPopped = Math.round((popCount / kernals.length) * 100);
  const time = gameDuration - timer;

  const winLossMessage = results.win
    ? `You escaped the maze in ${time} seconds and only popped ${percentPopped}% of the kernals!`
    : `You failed to escape the maze but at least you popped ${percentPopped}% of the kernals!`;


  return (
    <div className={`results modal ${results.won !== undefined ? '' : 'hidden'}`}>
      <div className="results-content modal-content">
        <h2>{message}</h2>
        <p>{winLossMessage}</p>
        <button type="button" onClick={playAgain}>Play Again!</button>
        <button type="button" onClick={playAgain}>Share!</button>

        <img className="graphic" src={cornImage} alt="corn" />
      </div>
    </div>
  );
};
export default Results;

Results.propTypes = {
  results: PropTypes.objectOf(PropTypes.shape),
  playAgain: PropTypes.func,
  timer: PropTypes.number,
  popCount: PropTypes.number,
  kernals: PropTypes.arrayOf(PropTypes.objectOf),
};

Results.defaultProps = {
  results: {},
  playAgain: () => { },
  timer: 0,
  popCount: 0,
  kernals: [],
};
