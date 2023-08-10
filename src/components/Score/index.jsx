import React, { useRef, useEffect, useState } from 'react';
import './index.scss';

const Score = (props) => {
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
};


export default Score;
