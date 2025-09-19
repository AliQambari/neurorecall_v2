// src/components/Login.jsx
import React, { useState, useContext } from "react";
import "../../styles/Authentication.css";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../components/AuthContext";
import PuffLoader from "react-spinners/PuffLoader";
import { useLanguage } from "../../components/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { setLogged, setIsAdmin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rawLoginStatus, setRawLoginStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useLanguage();

  const translateError = (errorMessage) => {
    if (!errorMessage) return "";
    if (language === "fa") {
      if (
        errorMessage.includes("This username does not exist") ||
        errorMessage.includes("Password is wrong")
      ) {
        const attempts = errorMessage.match(/(\d+) attempts remaining/);
        return attempts
          ? `رمز عبور نادرست است. ${attempts[1]} تلاش باقی مانده.`
          : "نام کاربری وجود ندارد.";
      }
      if (errorMessage.includes("locked")) {
        const minutes = errorMessage.match(/(\d+) minutes/);
        return minutes
          ? `حساب شما به دلیل تلاش‌های زیاد قفل شد. ${minutes[1]} دقیقه دیگر تلاش کنید.`
          : "حساب شما موقتاً قفل شده است.";
      }
      if (errorMessage.includes("Too many login attempts. Please try again later"))
        return "تلاش‌های زیادی انجام داده‌اید. لطفاً بعداً تلاش کنید.";
      if (errorMessage.includes("Username and password are required"))
        return "نام کاربری و رمز عبور الزامی است.";
      if (errorMessage.includes("Invalid input length"))
        return "طول ورودی نامعتبر است.";
      return errorMessage;
    }
    return errorMessage;
  };

  const onsubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.status === 200) {
        if (data.login === "failed") {
          const errorMessage = data.error || "Login failed";
          setRawLoginStatus(errorMessage);
        } else if (data.login === "successful") {
          setLogged(true);
          if (typeof data.isAdmin !== "undefined") {
            setIsAdmin(data.isAdmin === "true");
          } else {
            const adminResp = await fetch("/api/auth/check-admin");
            if (adminResp.ok) {
              const adminData = await adminResp.json();
              setIsAdmin(adminData.isAdmin === "true");
            }
          }

          navigate("/profile", true);
          setUsername("");
          setPassword("");
          setRawLoginStatus("");
        }
      } else if (response.status === 401) {
        const errorMessage =
          data.error === "Non-existent username"
            ? "This username does not exist."
            : `Password is wrong! (${data.error})`;
        setRawLoginStatus(errorMessage);
        console.log(errorMessage);
      } else if (response.status === 429) {
        const errorMessage = data.error;
        setRawLoginStatus(errorMessage);
      } else if (response.status === 423) {
        const errorMessage = `Your account is temporarily locked. Try again ${data.error} later.`;
        setRawLoginStatus(errorMessage);
      } else {
        const errorMessage = data.error || `${response.statusText}!`;
        setRawLoginStatus(errorMessage);
      }
    } catch (error) {
      console.log(error);
      setRawLoginStatus("Network error. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="authentication" dir={language === "en" ? "ltr" : "rtl"}>
      <div className="container-fluid">
        <div id="login" className="row align-items-stretch auth-row">
          {/* Hero image/text panel */}
          <div className="col-12 col-lg-5 half d-flex justify-content-center">
            <p className="half_title">
              {language === "en"
                ? "Continue with your personalized health journey today"
                : "امروز مسیر شخصی‌سازی‌شده سلامتی‌ات رو ادامه بده."}
            </p>
          </div>

          {/* Form panel */}
          <div className="col-12 col-lg-7 mt-4 mt-lg-0">
            <form onSubmit={onsubmit} className="auth-form">
              <img src={"./images/Logo.png"} alt="logo" className="auth-logo" />
              <div className="mb-3">
                <label htmlFor="usernameInput" className="form-label">
                  {language === "en" ? "Username" : "نام کاربری"}
                </label>
                <input
                  type="text"
                  value={username}
                  className="form-control"
                  id="usernameInput"
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  inputMode="text"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  {language === "en" ? "Password" : "رمز عبور"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  id="exampleInputPassword1"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div
                id="PasswordHelp"
                className="form-text PassForgot"
                style={{ textAlign: language === "en" ? "right" : "left" }}
              >
                <Link to="/forgotpassword">
                  {language === "en" ? "Forgot Password?" : "پسورد خود را فراموش کرده اید؟"}
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={isLoading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {isLoading ? (
                  <PuffLoader size={25} color="#fff" cssOverride={{ marginBottom: "0px" }} />
                ) : language === "en" ? (
                  "Login →"
                ) : (
                  "ورود ←"
                )}
              </button>

              <p className="login-status" aria-live="polite">{translateError(rawLoginStatus)}</p>

              <div className="bottomText form-text">
                {language === "en" ? "Don't have an account?" : "حساب کاربری ندارید؟"}
                <Link to="/register">{language === "en" ? " Sign up" : " ثبت نام"}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

