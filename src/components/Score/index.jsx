import React from 'react';
import PropTypes from 'prop-types';

import './index.scss';

function Score(props) {
  const { popCount, kernals, timer } = props;

  return (
    <div className="score">
      <p className="score-time">time: <span className="numbers">{timer}</span></p>
      <p className="score-kernals">kernals: <span className="numbers">{popCount}</span></p>
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
  popCount: PropTypes.number,
  kernals: PropTypes.arrayOf(PropTypes.shape),
  timer: PropTypes.number,
};

Score.defaultProps = {
  popCount: 0,
  kernals: [],
  timer: 0,
};
