import React, { useRef, useEffect, useState } from 'react';
import cornImage from '../../assets/corn2.png';
import { messages } from '../../assets/content.json';
import './index.scss';


const Instructions = (props) => {
  const { instructions, setInstructions, setDifficulty, start, startGame, page } = props;
  // console.log(setDifficulty);

  const positions = {
    end: 'right',
    start: 'left',
    go: '',
  };
  return (
    <div className={`instructions modal ${instructions ? '' : 'hidden'}`}>
      <div className={`instructions-content modal-content ${positions[page] || ''}`}>
        <h1 className="instructions-content-title">- MAIZ -</h1>
        <p>{messages.instructions[page]}</p>
        <p>Escape the Maiz by following the yellow path</p>
        {/* <p>🟡 Pop the yellow kernals 🟡<br /> 🟤 brown kernals are walls 🟤</p> */}
        <div className="option">
          <p>Difficulty:</p>
          <button type="button" onClick={() => { setDifficulty('easy'); }}>Easy 🌽</button>
          <button type="button" onClick={() => { setDifficulty('medium'); }}>Medium 🌽🌽</button>
          <button type="button" onClick={() => { setDifficulty('hard'); }}>Hard 🌽🌽🌽</button>
        </div>
        <img className="graphic" src={cornImage} alt="corn" />
        <button
          type="button"
          onClick={startGame}
        >{start ? 'Continue' : 'Start!'}
        </button>
      </div>
      <button
        type="button"
        className="close"
        onClick={() => { setInstructions(false); }}
      >×
      </button>
    </div>
  );
};

export default Instructions;
