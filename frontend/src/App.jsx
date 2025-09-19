import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./scenes/landing/Home";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Register from "./scenes/authentication/Register";
import Login from "./scenes/authentication/Login";
import Terms from "./components/Terms";
import Forgotpassword from "./scenes/authentication/Forgotpassword";
import ResetPassword from "./scenes/authentication/ResetPassword";
import Profile from "./scenes/profile/Profile";
import Help from "./components/Help";
import { useLanguage } from "./components/LanguageContext";

function App() {
  const [home, setHome] = useState(true);
  const { direction, fontFamily, letterSpacing } = useLanguage();

  useEffect(() => {
    if (
      window.location.pathname.toString() === "/" ||
      window.location.pathname.toString() === ""
    ) {
      setHome(true);
    } else {
      setHome(false);
    }
  }, []);

  return (
    <div className="App" dir={direction} style={{fontFamily: fontFamily, letterSpacing: letterSpacing}}>
      <Navbar home={home} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/password-reset/:token" element={<ResetPassword />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/*" element={<p>This page does not exist!</p>} />
      </Routes>
    </div>
  );
}

export default App;
