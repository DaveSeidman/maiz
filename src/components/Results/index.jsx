import React from 'react';
import './index.scss';
import { messages } from '../../assets/content.json';

const Results = (props) => {
  const { result } = props;
  // console.log('results');
  const index = Math.floor(Math.random() * messages[result].length);
  const message = messages[result][index];

  return (
    <div className="results">
      <div className="results-content">
        <h2>{message}</h2>
      </div>
    </div>
  );
};
export default Results;
