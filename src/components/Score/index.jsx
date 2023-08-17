import React from 'react';
import PropTypes from 'prop-types';

import './index.scss';

function Score(props) {
  const { popCount, kernals, timer } = props;

  return (
    <div className="score">
      <p className="score-time">time: {timer}</p>
      <p className="score-kernals">kernals: {popCount}</p>
      <div className="progress">
        <span
          className="progress-bar"
          css={{ width: `${(popCount / kernals.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Score;

Score.propTypes = {
  popCount: 0,
  kernals: PropTypes.arrayOf(PropTypes.shape),
  timer: PropTypes.number,
};

Score.defaultProps = {
  popCount: 0,
  kernals: [],
  timer: 0,
};
