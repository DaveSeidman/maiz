import React from 'react';
import cornImage from '../../assets/images/corn.png';
import { messages } from '../../assets/content.json';
import './index.scss';


const Instructions = (props) => {
  const { instructions, setInstructions, difficulty, setDifficulty, start, startGame, page } = props;
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
        {page && (<p>{messages.instructions[page]}</p>)}
        <p>Escape the Maiz by following the yellow path</p>
        {/* <p>🟡 Pop the yellow kernals 🟡<br /> 🟤 brown kernals are walls 🟤</p> */}
        <p>Difficulty:</p>
        <div className="options">
          <button type="button" className={difficulty === 'easy' ? 'selected' : ''} onClick={() => { setDifficulty('easy'); }}>
            Easy <span role="img" aria-label="corn">🌽</span>
          </button>
          <button type="button" className={difficulty === 'medium' ? 'selected' : ''} onClick={() => { setDifficulty('medium'); }}>
            Medium <span role="img" aria-label="corn">🌽</span>
          </button>
          <button type="button" className={difficulty === 'hard' ? 'selected' : ''} onClick={() => { setDifficulty('hard'); }}>
            Hard <span role="img" aria-label="corn">🌽</span>
          </button>
        </div>
        <img className="graphic" src={cornImage} alt="corn" />
        <button
          type="button"
          onClick={startGame}
        >{start ? 'Continue' : 'Start!'}
        </button>
      </div>
    </div>
  );
};

export default Instructions;
