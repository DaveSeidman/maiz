import React, { useRef, useEffect, useState } from 'react';
import cornImage from '../../assets/corn2.png';
import './index.scss';

const Instructions = (props) => {
  const { instructions, setInstructions } = props;
  const { start, startGame } = props;
  return (
    <div className={`instructions modalContainer ${instructions ? '' : 'hidden'}`}>
      <div className="instructions-content modal">
        <h1 className="instructions-content-title">- MAIZ- </h1>
        <p>Tap on the cob or use the arrow keys to make your way to the right end of the cob and escape the maiz!</p>
        <p>🟡 Pop the yellow kernals 🟡<br /> 🟤 brown kernals are walls 🟤</p>
        <div className="option">
          <p>Difficulty:</p>
          <label>
            <input type="radio" name="mode" value="easy" />
            Easy 🌽
          </label>
          <label>
            <input type="radio" name="mode" value="medium" />
            Medium 🌽🌽
          </label>
          <label>
            <input type="radio" name="mode" value="hard" />
            Hard 🌽🌽🌽
          </label>
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
