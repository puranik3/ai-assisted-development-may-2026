import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

function MyComponent() {
  return (
    <Container>
      <Row>
        <Col md={6}>
          <h1>Hello World!</h1>
        </Col>
        <Col md={6}>
          <Button variant="primary">Click Me</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default MyComponent;