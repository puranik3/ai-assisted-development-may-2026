import { Container } from "react-bootstrap";
import './ThreadList.css';

export default function ThreadList({ threads, onSelect }) {
  const handleUpvote = () => {
    alert('Upvote clicked!');
  };

  const handleDownvote = () => {
    alert('Downvote clicked!');
  };

  // now we have an array of divs
  const els = threads.map(
    t => <div>{t.title}</div>
  )

  return (
    <Container fluid className="px-0">
      {els}
    </Container>
  );
}
