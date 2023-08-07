import React, { useRef, useEffect, useState } from 'react';
import './index.scss';

const Instructions = (props) => {
  const { setInstructions } = props;
  // console.log('instructions page');
  return (
    <div className="instructions">
      <div className="instructions-content">
        <h2>Instructions</h2>
        <p>Use the arrow keys to make your way to the right end of the cob and escape the "maíz"!</p>
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
