import React, { useEffect, useState, useContext, useRef, Fragment } from "react";
import "../styles/Navbar.css";
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

  // Hamburger Menu (React-only state)
  const [menuOpen, setMenuOpen] = useState(false);
  
  const collapseRef = useRef(null);

  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  const logoutHandler = (e) => {
    e.preventDefault();
    setIsModalVisible(true);
  };

  // Update navbar styles based on route
  useEffect(() => {
    const onHome = location.pathname === "/";
    setBgClass(onHome ? "HomeBackground" : "GeneralBackground");
    setLinkClass(onHome ? "HomeLinkColor" : "GeneralLinkColor");
    setGeneralClass(onHome ? "NavbarHome" : "GeneralHome");
    setThemeClass(onHome ? "navbar-dark" : "navbar-light"); // critical for toggler icon
  }, [location.pathname]);

  // Close menu safely on mobile/tablet
  const closeMenu = () => {
    if (window.innerWidth < 992) {
      setMenuOpen(false);
    }
  };

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = collapseRef.current;
      const toggler = document.querySelector(".navbar-toggler");
      if (
        menuOpen &&
        navbar &&
        !navbar.contains(event.target) &&
        !(toggler && toggler.contains(event.target))
      ) {
        setMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (menuOpen && window.innerWidth < 992) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  // ---------- JSX ----------
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

          {/* Hamburger Button */}
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={menuOpen ? "true" : "false"}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapse Menu */}
          <div
            ref={collapseRef}
            className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
            id="navbarSupportedContent"
            style={{ justifyContent: "space-between" }}
          >
            <ul className="navbar-nav mb-2 mb-lg-0 pr-0 nav-ul">
              <li className="nav-item">
                <Link
                  className={`nav-link ${linkClass}`}
                  to="/"
                  onClick={closeMenu}
                >
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

            <ul className="navbar-nav mb-2 mb-lg-0 mt-1">
              <li className="nav-item">
                <Link
                  className={`nav-link ${linkClass}`}
                  to="/login"
                  onClick={closeMenu}
                >
                  <LuLogIn className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Login" : "ورود"}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link btn btn-primary px-4 navbarBtn"
                  to="/register"
                  onClick={closeMenu}
                >
                  <LuUserPlus className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Register →" : "ثبت نام"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  } else {
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

            {/* Hamburger Button */}
            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navbarSupportedContent"
              aria-expanded={menuOpen ? "true" : "false"}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="navbar-toggler-icon" />
            </button>

            {/* Collapse Menu */}
            <div
              ref={collapseRef}
              className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
              id="navbarSupportedContent"
              style={{ justifyContent: "space-between" }}
            >
              <ul className="navbar-nav nav-ul mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${linkClass}`}
                    to="/"
                    onClick={closeMenu}
                  >
                    <GoHome className="nav-ico" aria-hidden="true" />
                    {language === "en" ? "Home" : "خانه"}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${linkClass}`}
                    to="/profile"
                    onClick={closeMenu}
                  >
                    <LuUser className="nav-ico" aria-hidden="true" />
                    {language === "en" ? "Profile" : "پروفایل"}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${linkClass}`}
                    to="/profile/tests"
                    onClick={closeMenu}
                  >
                    <LuClipboardList className="nav-ico" aria-hidden="true" />
                    {language === "en" ? "Tests" : "آزمون ها"}
                  </Link>
                </li>

                {isAdmin && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${linkClass}`}
                      to="/profile/user-results"
                      onClick={closeMenu}
                    >
                      <LuUsers className="nav-ico" aria-hidden="true" />
                      {language === "en" ? "User Results" : "نتایج کاربران"}
                    </Link>
                  </li>
                )}

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

              <ul className="navbar-nav mb-2 mb-lg-0 mt-2">
                {isAdmin && (
                  <li className="nav-item d-flex align-items-center mb-3">
                    <NotificationBell />
                  </li>
                )}
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-primary px-4 navbarBtn logoutBtn"
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
}
