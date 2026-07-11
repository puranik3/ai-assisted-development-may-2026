import { useState } from 'react';

// Creation of Forms in Functional Component Example
const LoginForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("Name: " + name);
    console.log("Password: " + password);
  };
  return (
    <form onSubmit={submitHandler}>
      <label>Name</label>
      <input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} />
      <label>Password</label>
      <input type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <input type="submit" name="submit" />
    </form>
  );
};

export default LoginForm; 