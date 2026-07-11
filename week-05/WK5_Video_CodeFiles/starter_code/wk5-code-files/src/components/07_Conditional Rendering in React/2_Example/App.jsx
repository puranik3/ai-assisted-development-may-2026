function Existinguser() {
    return <h1>Welcome Back!</h1>;
}

function NewUser() {
    return <h1>Please Sign Up</h1>;
}

function Greeting(props) {
    return props.isLoggedIn ? <Existinguser /> : <NewUser />;
}

function App() {
  return Greeting({ isLoggedIn: true });
}

export default App