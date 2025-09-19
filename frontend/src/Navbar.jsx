// src/components/Navbar.jsx
import React, { useEffect, useState, useContext, useRef, Fragment } from "react";
import { Collapse } from 'bootstrap';
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

  // Hamburger Menu
  const collapseRef = useRef(null);
  const collapseInstanceRef = useRef(null);

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


  // Close Hamburger Menu
  const closeCollapseSafe = () => {
    if (window.innerWidth >= 992) return; // only on mobile/tablet

    const instance = collapseInstanceRef.current;
    if (instance) {
      // use API
      instance.hide();
    } else {
      // fallback to toggler click if instance not ready
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.click();
    }
  };


  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;

    // getOrCreateInstance prevents double instances (works well with StrictMode)
    collapseInstanceRef.current = Collapse.getOrCreateInstance(el, { toggle: false });

    return () => {
      if (collapseInstanceRef.current) {
        collapseInstanceRef.current.dispose();
        collapseInstanceRef.current = null;
      }
    };
  }, [logged]);

  useEffect(() => {
    const closeMenu = () => {
      if (window.innerWidth < 992) {
        const el = collapseRef.current;
        if (el && el.classList.contains('show')) {
          closeCollapseSafe();
        }
      }
    };

    const handleClickOutside = (event) => {
      const navbar = collapseRef.current;
      const toggler = document.querySelector('.navbar-toggler');
      if (navbar && !navbar.contains(event.target) && !(toggler && toggler.contains(event.target))) {
        closeMenu();
      }
    };

    window.addEventListener('scroll', closeMenu);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', closeMenu);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {
              if (collapseInstanceRef.current) {
                const isShown = collapseRef.current.classList.contains('show');
                if (isShown) {
                  collapseInstanceRef.current.hide();
                } else {
                  collapseInstanceRef.current.show();
                }
              }
            }}
          >
            <span className="navbar-toggler-icon" />
          </button>


          <div
            ref={collapseRef}
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
            style={{ justifyContent: "space-between" }} // keeps LTR/RTL symmetric without Bootstrap RTL build
          >
            <ul className="navbar-nav mb-2 mb-lg-0 pr-0 nav-ul">
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
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
                <Link className={`nav-link ${linkClass}`} to="/login" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
                  <LuLogIn className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Login" : "ورود"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-primary px-4 navbarBtn" to="/register" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
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

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {
              if (collapseInstanceRef.current) {
                const isShown = collapseRef.current.classList.contains('show');
                if (isShown) {
                  collapseInstanceRef.current.hide();
                } else {
                  collapseInstanceRef.current.show();
                }
              }
            }}
          >
            <span className="navbar-toggler-icon" />
          </button>


          <div
            ref={collapseRef}
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
            style={{ justifyContent: "space-between" }}
          >
            <ul className="navbar-nav nav-ul mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
                  <GoHome className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Home" : "خانه"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/profile" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
                  <LuUser className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Profile" : "پروفایل"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${linkClass}`} to="/profile/tests" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
                  <LuClipboardList className="nav-ico" aria-hidden="true" />
                  {language === "en" ? "Tests" : "آزمون ها"}
                </Link>
              </li>

              {isAdmin ? (
                <li className="nav-item">
                  <Link className={`nav-link ${linkClass}`} to="/profile/user-results" onClick={() => window.innerWidth < 992 && closeCollapseSafe()}>
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

