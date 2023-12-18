import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/helper/supabaseClient";

import "../styles/App.css";
import "../styles/LoginRegister.css";

function LoginPage() {
  const loginRedirect = useNavigate("/");
  const [loginErrors, setLoginErrors] = useState([]);

  async function loginUser() {
    let tempLoginErrors = [];
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "") {
      tempLoginErrors.push("* Email can't be blank.");
    }
    if (password === "") {
      tempLoginErrors.push("* Password can't be blank.");
    }

    if (tempLoginErrors.length !== 0) {
      setLoginErrors(tempLoginErrors);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
      options: {
        redirectTo: "localhost:3000/",
      },
    });
    if (error) {
      setLoginErrors(...tempLoginErrors, error.message);
    }
    if (data) {
      loginRedirect("/");
    }
  }

  return (
    <div className="login-register-page">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="intro.mp4" type="video/mp4" />
      </video>
      <div className="logo">
        <div className="image">
          <img src="logo.png" alt="Rocket League Logo" />
        </div>
      </div>
      <div className="content">
        <h1>
          Rocket League <br />{" "}
          <p>
            <i>R</i>
            <i>E</i>
            <i>P</i>
            <i>L</i>
            <i>A</i>
            <i>Y</i>
          </p>
        </h1>
        <div className="login-error">
          {loginErrors.length !== 0 ? (
            loginErrors.map((e) => <p key={e}>{e}</p>)
          ) : (
            <></>
          )}
        </div>
        <div className="input-wrap">
          <div className="input">
            <input type="text" id="email" placeholder="" />
            <div className="label">
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="input">
            <input type="password" id="password" placeholder="" />
            <div className="label">
              <label htmlFor="password">Password</label>
            </div>
          </div>
        </div>
        <button onClick={loginUser}>Login</button>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default LoginPage;
