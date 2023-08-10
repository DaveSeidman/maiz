import React, { useRef, useEffect, useState } from 'react';
import cornImage from '../../assets/corn2.png';
import { messages } from '../../assets/content.json';
import './index.scss';

const Instructions = (props) => {
  const { instructions, setInstructions, setDifficulty, start, startGame, page } = props;
  console.log(setDifficulty);
  return (
    <div className={`instructions modalContainer ${instructions ? '' : 'hidden'}`}>
      <div className="instructions-content modal">
        <h1 className="instructions-content-title">- MAIZ- </h1>
        <h2>{messages.instructions[page]}</h2>
        <p>Tap on the cob or use the arrow keys to make your way to the right end of the cob and escape the maiz!</p>
        <p>🟡 Pop the yellow kernals 🟡<br /> 🟤 brown kernals are walls 🟤</p>
        <div className="option">
          <p>Difficulty:</p>
          <button type="button" onClick={setDifficulty}>Easy 🌽</button>
          <button type="button" onClick={setDifficulty}>Medium 🌽🌽</button>
          <button type="button" onClick={setDifficulty}>Hard 🌽🌽🌽</button>
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
