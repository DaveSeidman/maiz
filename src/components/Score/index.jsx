import React, { useRef, useEffect, useState } from 'react';
import './index.scss';

const Score = (props) => {
  const { kernalsEaten } = props;

  return (
    <div className="score">
      <p className="score-time">time: 0:00</p>
      <p className="score-kernals">kernals: {kernalsEaten}</p>
    </div>
  );
};


export default Score;
