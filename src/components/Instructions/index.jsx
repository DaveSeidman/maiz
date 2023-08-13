import React from 'react';
import PropTypes from 'prop-types';
import cornImage from '../../assets/images/corn.png';
import { messages } from '../../assets/content.json';

import './index.scss';

const Instructions = (props) => {
  const { instructions, difficulty, setDifficulty, playing, animating, startGame, page } = props;
  // console.log(setDifficulty);

  const positions = [
    '',
    'right',
    'left',
    '',
  ];

  return (
    <div className={`instructions modal ${instructions ? '' : 'hidden'} ${positions[page] || ''}`}>
      <div className="instructions-content modal-content">
        <h1 className="instructions-content-title">- MAIZ -</h1>
        <p>{messages.instructions[page]}</p>
        {!animating && (
          <div className="difficulty">
            <p>Difficulty:</p>
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

        )}
        {(!playing && !animating) && (
          <button
            type="button"
            onClick={startGame}
          >{playing ? 'Continue' : 'Start!'}
          </button>
        )}
        <img className="graphic" src={cornImage} alt="corn" />
      </div>
    </div>
  );
};

export default Instructions;

Instructions.propTypes = {
  instructions: PropTypes.bool,
  difficulty: PropTypes.string,
  setDifficulty: PropTypes.func,
  startGame: PropTypes.func,
  page: PropTypes.number,
  playing: PropTypes.bool,
};

Instructions.defaultProps = {
  instructions: false,
  difficulty: 'medium',
  setDifficulty: () => { },
  startGame: () => { },
  page: 0,
  playing: false,
};
