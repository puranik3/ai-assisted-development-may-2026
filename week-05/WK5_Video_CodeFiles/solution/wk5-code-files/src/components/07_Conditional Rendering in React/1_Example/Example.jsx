function Example(props) {
  if (props.isLoggedIn === true) {
    return <p>Welcome back!</p>
  } else {
    return <p>Please log in.</p>
  }
}
export default Example
