// TODO: rerendering with timer
import React, { useEffect, useState } from 'react';
import { RWebShare } from 'react-web-share';
import cornImage from '../../assets/images/maiz-logo.png';

import './index.scss';
import { messages, metadata } from '../../assets/content.json';
import { gameDuration } from '../../config';

import PropTypes from 'prop-types';

function Results(props) {
  const { results, playAgain, timer, popCount, kernals, setShare } = props;
  const { title, text, url } = metadata;
  const [wonLostMessage, setWonLostMessage] = useState('');

  const index = Math.floor(Math.random() * messages.won.length);
  const message = messages[results.won ? 'won' : 'lost'][index];
  let shareMessage;

  const percentPopped = Math.round((popCount / kernals.length) * 100);
  const time = gameDuration - timer;

  if (results.won !== undefined) {
    const shareMessages = messages.share[results.won ? 'win' : 'loss'];
    shareMessage = shareMessages[Math.floor(Math.random() * shareMessages.length)];
    shareMessage = shareMessage.replace('popCount', popCount);
    shareMessage = shareMessage.replace('<kernalTotal>', kernals.total);
  }

  useEffect(() => {
    setWonLostMessage(results.won
      ? `You escaped the maze in ${time} seconds and only popped ${percentPopped}% of the kernals!`
      : `You failed to escape the maze but at least you popped ${percentPopped}% of the kernals!`);
  }, [results]);

  return (
    <div className={`results modal ${results.won !== undefined ? '' : 'hidden'}`}>
      <div className="results-content modal-content">
        <h2>{message}</h2>
        <p>{wonLostMessage}</p>
        <button type="button" onClick={playAgain}>Play Again!</button>
        {/* <RWebShare
          data={{ text: shareMessage, url, title }}
          sites={['twitter', 'facebook', 'linkedin', 'reddit', 'mail', 'copy']}
          onClick={() => console.log('shared successfully!')}
        >

        </RWebShare> */}
        <button
          type="button"
          onClick={() => { setShare(true); }}
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
};

Results.defaultProps = {
  results: {},
  playAgain: () => { },
  timer: 0,
  popCount: 0,
  kernals: [],
};
