import React, { useRef, useEffect, useState } from 'react';
import cornImage from '../../assets/corn2.png';
import './index.scss';

const Instructions = (props) => {
  const { setInstructions } = props;
  const { start } = props;
  // console.log('instructions page');
  return (
    <div className="instructions">
      <div className="instructions-content">
        <h1 className="instructions-content-title">- MAIZ- </h1>
        <p>Use the arrow keys to make your way to the right end of the cob and escape the maiz!</p>
        <p>In regular mode, you can only move to yellow kernals, brown kernals are walls.</p>
        {/* <div className="options"> */}
        {/* <h3>Options</h3> */}
        {/* <div className="option">
          <p>Mode:</p>
          <label for="normal">normal</label>
          <input type="radio" name="mode" value="normal" />
          <label for="normal">free</label>
          <input type="radio" name="mode" value="free" />
        </div> */}
        <img className="graphic" src={cornImage} alt="corn" />
        <button
          type="button"
          onClick={start}
        >Start!
        </button>
      </div>
      {/* </div> */}
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
