import React from 'react';
import './index.scss';
import {
  EmailShareButton, EmailIcon,
  FacebookShareButton, FacebookIcon,
  LinkedinShareButton, LinkedinIcon,
  RedditShareButton, RedditIcon,
  TwitterShareButton, TwitterIcon,
} from 'react-share';
import { messages } from '../../assets/content.json';

const random = array => array[Math.floor(Math.random() * array.length)];

const Results = (props) => {
  const { result } = props;
  const index = Math.floor(Math.random() * messages[result].length);
  const message = messages[result][index];

  const url = 'https://daveseidman.gitlab.io/cornmaze';

  return (
    <div className="results">
      <div className="results-content modal">
        <h2>{message}</h2>
        <div className="results-content-share">
          <h3>Now go and brag about it!</h3>
          <TwitterShareButton
            url={url}
            title={random(messages.share.titles)}
            hashtags={messages.share.hashtags}
          ><TwitterIcon />
          </TwitterShareButton>
          <FacebookShareButton
            url={url}
            quote="test quote"
            hashtag="#webgl,#threejs,#reactthreefiber"
          ><FacebookIcon />
          </FacebookShareButton>
          <LinkedinShareButton
            url={url}
            title={random(messages.share.titles)}
            summary="test summary"
            source={url}
          >
            <LinkedinIcon />
          </LinkedinShareButton>
          <RedditShareButton
            url={url}
            title={random(messages.share.titles)}
          ><RedditIcon />
          </RedditShareButton>
          <EmailShareButton
            url={url}
            subject={random(messages.share.titles)}
          ><EmailIcon />
          </EmailShareButton>
        </div>
      </div>
    </div>
  );
};
export default Results;
