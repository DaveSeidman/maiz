import React, { useState, useRef, useEffect } from 'react';
import './index.scss';

const Controls = (props) => {
  const { setMove, display, setDisplay } = props;

  const handleClick = (move) => {
    setMove(move);
  };
  const toggleDisplay = () => {
    const nextDisplay = display === '3d' ? '2d' : '3d';
    setDisplay(nextDisplay);
  };

  return (
    <div className="controls">
      <button type="button" onClick={() => handleClick({ x: 0, y: -1 })}>↑</button>
      <button type="button" onClick={() => handleClick({ x: 0, y: 1 })}>↓</button>
      <button type="button" onClick={() => handleClick({ x: -1, y: 0 })}>←</button>
      <button type="button" onClick={() => handleClick({ x: 1, y: 0 })}>→</button>
      <button type="button" onClick={toggleDisplay}>{display.toUpperCase()}</button>
    </div>
  );
};

export default Controls;
