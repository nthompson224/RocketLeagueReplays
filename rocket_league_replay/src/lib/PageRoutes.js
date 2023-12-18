import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <div>
              <h1>HOME</h1>
            </div>
          }
        ></Route>
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
