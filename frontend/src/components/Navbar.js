import React, { useContext, useEffect, useState }
  from "react";

import { Link, useNavigate }
  from "react-router-dom";

import axios from "axios";
import { AuthContext }
  from "../context/AuthContext";

function Navbar() {

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {

    const u =
      JSON.parse(localStorage.getItem("user"));

    setUser(u);

    axios.get(
      "http://localhost:5000/api/notifications"
    )
      .then(res => {

        const total =
          res.data.upcoming.length +
          res.data.missed.length +
          res.data.emergency.length;

        setCount(total);

      })
      .catch(() => setCount(0));

  }, []);

  const signout = () => {
    logout();
    navigate("/login");
  };

  return (

    <div className="navbar">

      <h2>⚖ Lex Attorney</h2>

      <div className="nav-links">

        <Link to="/">Home</Link>
        <Link to="/cases">Cases</Link>
        <Link to="/clients">Clients</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/profile">Profile</Link>

        {/* ✅ minimal usage of user */}
        <span>{user?.name}</span>

        <span>🔔 {count}</span>

        <button onClick={signout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;