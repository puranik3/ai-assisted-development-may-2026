import "./Header.css"

function Header({ onNavigate, isAuthenticated }) {
  const handleLogout = () => {
    // Logout logic will be handled by parent component
    // For now, navigate to login
    onNavigate('login');
  };

  const handleResetPassword = () => {
    onNavigate('reset-password');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="title">ThreadHive</h1>
      </div>
      <div className="header-right">
      {
        isAuthenticated ? (
          <>
            <button onClick={handleResetPassword}>Reset Password</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')}>Login</button>
            <button onClick={() => onNavigate('register')}>Register</button>
          </>
        )
      }
      </div>
    </header>
  );
}

export default Header;