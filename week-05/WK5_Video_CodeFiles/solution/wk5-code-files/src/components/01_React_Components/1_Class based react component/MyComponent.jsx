import React, { Component } from 'react';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { message: 'Hello, Welcome to Great Learning!' };
  }
  render() {
    return <h1>{this.state.message}</h1>;
  }
}

export default MyComponent;
