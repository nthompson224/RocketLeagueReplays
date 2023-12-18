import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";
import ClipsPage from "./pages/ClipsPage";
import AccountPage from "./pages/AccountPage";
import PublicAccountPage from "./pages/PublicAccountPage";

import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />}></Route>
        <Route exact path="/clips" element={<ClipsPage />}></Route>
        <Route exact path="/profile" element={<AccountPage />} />
        <Route
          exact
          path="/account/:id"
          element={<PublicAccountPage props={{ username: "" }} />}
        />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/register" element={<RegisterPage />} />
        <Route exact path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
  // <>
  //   {userID === "" ? (
  //     <LoginPage />
  //   ) : (
  //     <div className="page-base">
  //       <header className="app-header">
  //         <pre id="output"></pre>
  //         <p>
  //           Choose a .replay file to upload:
  //           <br />
  //           <input type="file" id="file-selector"></input>
  //           <br />
  //           Send .replay file to database:
  //           <br />
  //           <button onClick={uploadReplayToStorage} id="upload file">
  //             Upload file
  //           </button>
  //           ;
  //         </p>
  //       </header>
  //     </div>
  //   )}
  // </>
}

export default App;
