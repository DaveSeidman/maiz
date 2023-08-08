import React from 'react';
import './index.scss';
import { EmailShareButton, FacebookShareButton, LinkedinShareButton, RedditShareButton, TwitterShareButton } from 'react-share';
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
        {/* <a href="share">Share Your Results!</a> */}
        <TwitterShareButton
          url="https://daveseidman.gitlab.io/cornmaze"
          title="try your luck!"
          caption="a corn maze"
          hashtags={['webgl', 'corn']}
        >share me
        </TwitterShareButton>
      </div>
    </div>
  );
};
export default Results;
