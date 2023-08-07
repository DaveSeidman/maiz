import React, { useRef, useEffect, useState } from 'react';
import './index.scss';

const Score = (props) => {
  const { kernalsEaten, timer } = props;

  return (
    <div className="score">
      <p className="score-time">time: {timer.elapsed}</p>
      <p className="score-kernals">kernals: {kernalsEaten}</p>
    </div>
  );
};


export default Score;
