import { useState } from "react";
import { supabase } from "../lib/helper/supabaseClient.js";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const registerRedirect = useNavigate();
  const [registerErrors, setRegisterErrors] = useState([]);

  async function handleRegisterClick() {
    let tempRegisterError = [];
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (username === "") {
      tempRegisterError.push("* Username can't be blank.");
    }
    if (await checkUserName(username)) {
      tempRegisterError.push("* Username is already taken.");
    }
    if (email === "") {
      tempRegisterError.push("* Email can't be blank.");
    }
    if (password === "") {
      tempRegisterError.push("* Password can't be the blank.");
    }
    if (confirmPassword !== password && password !== "") {
      tempRegisterError.push(
        "* Password and confirm password must be the same."
      );
    }

    if (tempRegisterError.length !== 0) {
      setRegisterErrors(tempRegisterError);
      return;
    }

    const { data, error } = await supabase.auth.signUp(
      {
        email: email,
        password: password,
      },
      {
        data: {
          username: username,
        },
      }
    );
    if (error) {
      setRegisterErrors(...tempRegisterError, error.message);
      return;
    }
    if (data) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        user_name: username,
      });
      registerRedirect("/");
    }
  }

  async function checkUserName(username) {
    const userName = await supabase
      .from("profiles")
      .select("user_name")
      .eq("user_name", username);
    return userName.data.length !== 0;
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
          {registerErrors.length !== 0 ? (
            registerErrors.map((e) => <p key={e}>{e}</p>)
          ) : (
            <></>
          )}
        </div>
        <div className="input-wrap">
          <div className="input">
            <input type="text" id="username" placeholder="" />
            <div className="label">
              <label htmlFor="username">Username</label>
            </div>
          </div>
          <div className="input">
            <input type="email" id="email" placeholder="" />
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
          <div className="input">
            <input type="password" id="confirmPassword" placeholder="" />
            <div className="label">
              <label htmlFor="confirmPassword">Confirm Password</label>
            </div>
          </div>
        </div>
        <button type="submit" onClick={handleRegisterClick}>
          Register
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
