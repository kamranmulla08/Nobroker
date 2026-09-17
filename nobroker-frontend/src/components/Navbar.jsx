import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  console.log("Navbar auth:", {
    user,
    isAuthenticated,
    loading,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          NoBroker
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/properties">
            Properties
          </Link>

          {!loading && isAuthenticated &&
            user?.role === "OWNER" && (
              <>
                <Link to="/post-property">
                  Post Property
                </Link>
                <Link to="/owner-dashboard">
                  Owner Dashboard
                </Link>
              </>
            )}

          {!loading && isAuthenticated &&
            user?.role === "BUYER" && (
              <Link to="/my-interests">
                My Interests
              </Link>
            )}

          {!loading && isAuthenticated && (
            <Link to="/conversations">
              Conversations
            </Link>
          )}

          {!loading && isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="profile-link"
              >
                {user?.name || "Profile"}
              </Link>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
