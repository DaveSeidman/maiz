import React, { useState, useRef, useEffect } from 'react';
import './index.scss';

const Controls = (props) => {
  const { setMove, display, setDisplay, mode, setMode } = props;

  const handleClick = (move) => {
    setMove(move);
  };
  const toggleDisplay = () => {
    const nextDisplay = display === '3d' ? '2d' : '3d';
    setDisplay(nextDisplay);
  };

  const toggleMode = () => {
    const nextMode = mode === 'normal' ? 'free' : 'normal';
    setMode(nextMode);
  };

  return (
    <div>
      <div className="controls">
        <div className="row">
          <button type="button" onClick={() => handleClick({ x: 0, y: -1 })}>↑</button>
        </div>
        <div className="row">
          <button type="button" onClick={() => handleClick({ x: -1, y: 0 })}>←</button>
          <button type="button" onClick={() => handleClick({ x: 0, y: 1 })}>↓</button>
          <button type="button" onClick={() => handleClick({ x: 1, y: 0 })}>→</button>
        </div>
      </div>
      <div className="options">
        <button type="button" onClick={toggleDisplay}>{display.toUpperCase()}</button>
        <button type="button" onClick={toggleMode}>{mode}</button>
      </div>
    </div>
  );
};

export default Controls;
