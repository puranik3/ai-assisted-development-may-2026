import { useEffect, useState } from 'react';
import { fetchCommentsForThread } from '../../services/commentService';
import CommentList from '../../components/Comment/CommentList';
import CommentForm from '../../components/Comment/CommentForm';
import ThreadCard from '../../components/ThreadList/ThreadCard';
import { Container, Card } from "react-bootstrap";
import './ThreadPage.css';

export default function ThreadPage({ thread, goBack }) {
  const [threadComments, setThreadComments] = useState([]);

  useEffect(() => {
    fetchCommentsForThread(thread._id).then(setThreadComments);
  }, [thread._id]);

  return (
    <Container className="thread-container">
      {/* Your Code here  */}
    </Container>
  );
}
