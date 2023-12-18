import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import { supabase } from "../helper/supabaseClient";

import "../../styles/NavBar.css";

function NavBar(props) {
  const loginRedirect = useNavigate();
  const [dropdownClicked, setDropdownClicked] = useState(false);

  async function handleSignOutClicked() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    loginRedirect("/login");
  }

  function handleDropdownClicked() {
    setDropdownClicked(!dropdownClicked);
  }

  return (
    <>
      <div className="logo">
        <div className="image">
          <img src="logo.png" alt="Rocket League Logo" />
        </div>
        <div className="text">
          <h1>
            Rocket League
            <br />
            <p>
              <i>R</i>
              <i>E</i>
              <i>P</i>
              <i>L</i>
              <i>A</i>
              <i>Y</i>
            </p>
          </h1>
        </div>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/clips">Clips</Link>
          </li>
          <li>
            <Link to="/upload">Upload</Link>
          </li>
          <div className="dropdown-container">
            <div className="dropdown">
              <button type="button" onClick={handleDropdownClicked}>
                ☰
              </button>
              {dropdownClicked ? (
                <div className="dropdown-box">
                  <ul>
                    <li>
                      <Link to={{ pathname: `/profile` }}>
                        <MdAccountCircle viewBox="0 0 24 20" className="icon" />
                        Account
                      </Link>
                    </li>
                    <div></div>
                    <li>
                      <button
                        className="sign-out"
                        onClick={handleSignOutClicked}
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="dropdown-box-hidden"></div>
              )}
            </div>
          </div>
        </ul>
      </nav>
    </>
  );
}

export default NavBar;
