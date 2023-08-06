import React, { useRef, useEffect, useState } from 'react';
import './index.scss';

const Instructions = (props) => {
  const { setInstructions } = props;
  console.log('instructions page');
  return (
    <div className="instructions">
      <div className="instructions-content">
        <h2>Instructions</h2>
        <p>escape the maze!</p>
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
