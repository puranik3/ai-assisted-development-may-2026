import "./Header.css"

function Header({ onNavigate }) {
  const isAuthenticated = false;

   // Dummy authentication variable. Will be eventually replaced with actual authentication logic.
   // Todo: define respective functions

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="title">ThreadHive</h1>
      </div>
      <div className="header-right">
      {
        isAuthenticated ? (
          <>
            <button>Reset Password</button>
            <button>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')}>Login</button>
            <button onClick={() => onNavigate('register')}  >Register</button>
          </>
        )
      }
      </div>
    </header>
  );
}

export default Header;