import { Container } from "react-bootstrap";
import VoteButtons from "../Shared/VoteButtons";

import './ThreadList.css';

export default function ThreadList({ threads, onSelect }) {
  const handleUpvote = () => {
    alert('Upvote clicked!');
  };

  const handleDownvote = () => {
    alert('Downvote clicked!');
  };

  // now we have an array of divs
  // const els = threads.map(
  //   t => <div key={t._id}>{t.title}</div>
  // );

  return (
    <Container fluid className="px-0">
      {
        threads.map(
          t => (
            <div key={t._id} className="thread-card">
              <div className="thread-card-body">
                {/* Voting Section */}
                <div className="vote-section">
                  <VoteButtons
                    count={t.voteCount}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    btnClassName="vote-btn"
                    countClassName="vote-count"
                  />
                </div>
              </div>
            </div>
          )
        )
      }
    </Container>
  );
}
