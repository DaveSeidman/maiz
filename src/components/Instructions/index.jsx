import React from 'react';
import PropTypes from 'prop-types';
import cornImage from '../../assets/images/corn.png';
import { messages } from '../../assets/content.json';

import './index.scss';

const Instructions = (props) => {
  const { instructions, setInstructions, difficulty, setDifficulty, start, startGame, page } = props;
  // console.log(setDifficulty);

  const positions = [
    '',
    'left',
    'right',
    '',
  ];

  return (
    <div className={`instructions modal ${instructions ? '' : 'hidden'} ${positions[page] || ''}`}>
      <div className="instructions-content modal-content">
        <h1 className="instructions-content-title">- MAIZ -</h1>
        <p>{messages.instructions[page]}</p>
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
        {page === 0 && (
          <button
            type="button"
            onClick={startGame}
          >{start ? 'Continue' : 'Start!'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Instructions;


Instructions.propTypes = {
  instructions: PropTypes.bool,
  setInstructions: PropTypes.func,
  difficulty: PropTypes.string,
  setDifficulty: PropTypes.func,
  start: PropTypes.bool,
  startGame: PropTypes.func,
  page: PropTypes.number,
};

Instructions.defaultProps = {
  instructions: false,
  setInstructions: () => {},
  difficulty: 'medium',
  setDifficulty: () => {},
  start: false,
  startGame: () => {},
  page: 0,
};
