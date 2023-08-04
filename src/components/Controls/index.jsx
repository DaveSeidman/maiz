import React, { useState, useRef, useEffect } from 'react';
import './index.scss';

const Controls = (props) => {
  const { setMove } = props;

  const handleClick = (move) => {
    setMove(move);
  };

  return (
    <div className="controls">
      <button type="button" onClick={() => handleClick({ x: 0, y: -1 })}>↑</button>
      <button type="button" onClick={() => handleClick({ x: 0, y: 1 })}>↓</button>
      <button type="button" onClick={() => handleClick({ x: -1, y: 0 })}>←</button>
      <button type="button" onClick={() => handleClick({ x: 1, y: 0 })}>→</button>
    </div>
  );
};

export default Controls;
