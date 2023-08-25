// TODO: rerendering with timer
import React, { useEffect, useState } from 'react';
import { RWebShare } from 'react-web-share';
import cornImage from '../../assets/images/maiz-logo.png';

import './index.scss';
import { messages, metadata } from '../../assets/content.json';
import { gameDuration } from '../../config';

import PropTypes from 'prop-types';

function Results(props) {
  const { results, playAgain, timer, popCount, kernals, setShareHandler } = props;
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');

  const percentPopped = Math.round((popCount / kernals.length) * 100);
  const time = gameDuration - timer;

  useEffect(() => {
    console.log('here', results);
    if (results.won !== undefined) {
      setMessage(results.won
        ? messages.won[Math.floor(Math.random() * messages.won.length)]
        : messages.lost[Math.floor(Math.random() * messages.lost.length)]);

      setDetails(results.won
        ? `You escaped the maze in ${time} seconds and only popped ${percentPopped}% of the kernals!`
        : `You failed to escape the maze but at least you popped ${percentPopped}% of the kernals!`);
    }
  }, [results]);

  return (
    <div className={`results modal ${results.won !== undefined ? '' : 'hidden'}`}>
      <div className="results-content modal-content">
        <h2>{message}</h2>
        <p>{details}</p>
        <button type="button" onClick={playAgain}>Play Again!</button>
        <button
          type="button"
          onClick={() => { setShareHandler(true); }}
        >
          Share
        </button>
        <img className="graphic" src={cornImage} alt="corn" />
      </div>
    </div>
  );
}
export default Results;

Results.propTypes = {
  results: PropTypes.objectOf(PropTypes.shape),
  playAgain: PropTypes.func,
  timer: PropTypes.number,
  popCount: PropTypes.number,
  kernals: PropTypes.arrayOf(PropTypes.objectOf),
  setShareHandler: PropTypes.func,
};

Results.defaultProps = {
  results: {},
  playAgain: () => { },
  timer: 0,
  popCount: 0,
  kernals: [],
  setShareHandler: () => { },
};
