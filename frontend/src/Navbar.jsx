// src/components/Navbar.jsx
import React, { useEffect, useState, useContext, Fragment } from "react";
import "./Navbar.css";
import { AuthContext } from "./AuthContext";
import { Link, useLocation } from "react-router-dom";
import LogoutAlert from "./LogoutAlert";
import { useLanguage } from "./LanguageContext";
import { GrLanguage } from "react-icons/gr";
import {
  LuUser,
  LuClipboardList,
  LuUsers,
  LuLogIn,
  LuUserPlus,
  LuLogOut,
} from "react-icons/lu";
import { GoHome } from "react-icons/go";
import NotificationBell from "./NotificationBell";


export default function Navbar() {
  const { logged, isAdmin } = useContext(AuthContext);

  // Appearance classes
  const [bgClass, setBgClass] = useState("HomeBackground");
  const [linkClass, setLinkClass] = useState("HomeLinkColor");
  const [generalClass, setGeneralClass] = useState("NavbarHome");
  const [themeClass, setThemeClass] = useState("navbar-dark"); // ensures hamburger icon is visible

  // Logout Modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  const logoutHandler = (e) => {
    e.preventDefault();
    setIsModalVisible(true);
  };

  useEffect(() => {
    const onHome = location.pathname === "/";
    setBgClass(onHome ? "HomeBackground" : "GeneralBackground");
    setLinkClass(onHome ? "HomeLinkColor" : "GeneralLinkColor");
    setGeneralClass(onHome ? "NavbarHome" : "GeneralHome");
    setThemeClass(onHome ? "navbar-dark" : "navbar-light"); // critical for toggler icon
  }, [location.pathname]);

  if (!logged) {
    return (
      <nav
        dir={language === "en" ? "ltr" : "rtl"}
        className={`navbar navbar-expand-lg ${themeClass} px-lg-5 px-3 pt-3 pb-3 ${bgClass} ${generalClass}`}
      >
        <div className="container-fluid px-lg-5 px-3">
          <Link className={`navbar-brand ${linkClass} navbarBrand`} to="/">
            NeuroRecall
          </Link>

          {/* Do not apply custom color classes here; themeClass controls icon */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
            style={{ justifyContent: "space-between" }} // keeps LTR/RTL symmetric without Bootstrap RTL build
          >
            <ul className="navbar-nav mb-2 mb-lg-0 pr-0 nav-ul">
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/">
                  <GoHome className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Home" : "خانه"}
                </Link>
              </li>
              <li className="nav-item">
                <button
                  onClick={toggleLanguage}
                  className={`language-toggle ${linkClass}`}
                >
                  <GrLanguage style={{ marginInlineEnd: "0.5rem" }} />
                  {language === "en" ? "Persian" : "انگلیسی"}
                </button>
              </li>
            </ul>

            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/login">
                  <LuLogIn className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Login" : "ورود"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-primary px-4 navbarBtn" to="/register">
                  <LuUserPlus className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Register →" : "ثبت نام"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <Fragment>
      <LogoutAlert
        alertText={
          language === "en"
            ? "Are you sure you want to log out of your account?"
            : "آیا مطمئن هستید که می خواهید از حساب خود خارج شوید؟"
        }
        buttonText={language === "en" ? "Log out" : "خروج"}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <nav
        dir={language === "en" ? "ltr" : "rtl"}
        className={`navbar navbar-expand-lg ${themeClass} px-lg-5 px-3 pt-3 pb-3 ${bgClass} ${generalClass}`}
      >
        <div className="container-fluid px-lg-5 px-3">
          <Link className={`navbar-brand ${linkClass} navbarBrand`} to="/">
            NeuroRecall
          </Link>

          {/* Toggler icon visibility fixed by themeClass */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
            style={{ justifyContent: "space-between" }}
          >
            <ul className="navbar-nav nav-ul mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/">
                  <GoHome className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Home" : "خانه"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/profile">
                  <LuUser className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Profile" : "پروفایل"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/profile/tests">
                  <LuClipboardList className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Tests" : "آزمون ها"}
                </Link>
              </li>

              {isAdmin ? (
                <li className="nav-item">
                  <Link className={`nav-link ${linkClass}`} to="/profile/user-results">
                    <LuUsers className="nav-ico" aria-hidden="true" />
                    {language === "en" ? "User Results" : "نتایج کاربران"}
                  </Link>
                </li>
              ) : null}

              <li className="nav-item">
                <button
                  onClick={toggleLanguage}
                  className={`language-toggle ${linkClass}`}
                >
                  <GrLanguage style={{ marginInlineEnd: "0.5rem" }} />
                  {language === "en" ? "Persian" : "انگلیسی"}
                </button>
              </li>
            </ul>

            <ul className="navbar-nav mb-2 mb-lg-0">
              {isAdmin && (
                <li className="nav-item d-flex align-items-center">
                  <div className={linkClass}>
                    <NotificationBell />
                  </div>
                </li>
              )}
              <li className="nav-item">
                <button
                  className="nav-link btn btn-primary px-4 navbarBtn"
                  onClick={logoutHandler}
                >
                  {language === "en" ? `Logout ` : "خروج"}
                  <LuLogOut style={{ marginInlineStart: "0.5rem" }} />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </Fragment>
  );
}

