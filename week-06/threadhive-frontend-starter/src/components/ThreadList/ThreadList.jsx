import { Container } from "react-bootstrap";
import './ThreadList.css';

export default function ThreadList({ threads, onSelect }) {
  const handleUpvote = () => {
    alert('Upvote clicked!');
  };
  const handleDownvote = () => {
    alert('Downvote clicked!');
  };

  return (
    <Container fluid className="px-0">
      {/* Your Code Here  */}
    </Container>
  );
}
