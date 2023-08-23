import React from 'react';
import PropTypes from 'prop-types';
import isMobile from 'is-mobile';
import cornImage from '../../assets/images/maiz-logo.png';
import arrowKeys from '../../assets/images/arrow-keys.svg';
import { messages } from '../../assets/content.json';
import './index.scss';

function Instructions(props) {
  const {
    instructions,
    difficulty,
    setDifficulty,
    playing,
    animating,
    startGame,
    continueGame,
    page,
  } = props;

  const mobile = isMobile();

  const positions = [
    '',
    'right',
    'left',
    '',
  ];

  return (
    <div className={`instructions modal ${instructions ? '' : 'hidden'}`}>
      <div className={`instructions-content modal-content  ${positions[page] || ''}`}>
        <h1 className="instructions-content-title">- MAIZ -</h1>
        <p>{messages.instructions[mobile ? 'mobile' : 'desktop'][page]}</p>
        {page === 0 && (
          <div className="difficulty">
            <h3>Difficulty:</h3>
            <div className="difficulty-options">
              <button type="button" className={difficulty === 'easy' ? 'selected' : ''} onClick={() => { setDifficulty('easy'); }}>
                Easy
              </button>
              <button type="button" className={difficulty === 'medium' ? 'selected' : ''} onClick={() => { setDifficulty('medium'); }}>
                Medium
              </button>
              <button type="button" className={difficulty === 'hard' ? 'selected' : ''} onClick={() => { setDifficulty('hard'); }}>
                Hard
              </button>
            </div>
          </div>
        )}
        {page === 2 && (
          <img
            src={arrowKeys}
            alt="arrow keys"
            className="arrows"
          />
        )}
        {(page === 0 || page === 4) && (
          <button
            type="button"
            className="pulse"
            onClick={() => {
              if (page === 0) startGame();
              else continueGame();
            }}
          >
            {page === 4 ? 'Continue' : 'Start!'}
          </button>
        )}
        <img className="graphic" src={cornImage} alt="corn" />
      </div>
    </div>
  );
}

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
