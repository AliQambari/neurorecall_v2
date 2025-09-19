import React, { useState } from "react";
import "../../styles/Authentication.css";
import AuthAlert from "../../components/AuthAlert";
import PuffLoader from "react-spinners/PuffLoader";
import { useLanguage } from '../../components/LanguageContext';
import { Link } from "react-router-dom";

export default function Forgotpassword() {
  // Email State
  const [email, setEmail] = useState("");
  // Store backend error key (raw message)
  const [emailStatusKey, setEmailStatusKey] = useState("");
  // Modal Visibility State
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useLanguage();
  
  // Email validation function
  const isValidEmail = (email) => {
    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return pattern.test(email);
  };

  // Translation map for backend error messages
  const errorMessages = {
    "Please enter a valid email address!": {
      en: "Please enter a valid email address!",
      fa: "لطفاً یک آدرس ایمیل معتبر وارد کنید!"
    },
    "Email is required.": {
      en: "Email is required.",
      fa: "ایمیل الزامی است."
    },
    "Invalid email format.": {
      en: "Invalid email format.",
      fa: "فرمت ایمیل نامعتبر است."
    },
    "Too many reset requests. Please try again later.": {
      en: "Too many reset requests. Please try again later.",
      fa: "تعداد درخواست‌های بازنشانی بیش از حد است. لطفاً بعداً دوباره تلاش کنید."
    },
    "Reset email already sent recently.": {
      en: "Reset email already sent recently.",
      fa: "ایمیل بازنشانی اخیراً ارسال شده است."
    },
    "Email does not exist!": {
      en: "Email address does not exist!",
      fa: "آدرس ایمیل موجود نیست!"
    },
    "Internal server error.": {
      en: "Internal server error.",
      fa: "خطای داخلی سرور."
    }
  };

  // Translate backend error to selected language
  const translateError = (key) => {
    if (!key) return "";

    // Handle dynamic case: "Reset email already sent. Try again in X minutes."
    if (key.startsWith("Reset email already sent.")) {
      const match = key.match(/(\d+)\s+minutes?/);
      const minutes = match ? match[1] : "";
      if (language === "en") {
        return `Reset email already sent. Try again in ${minutes} minutes.`;
      } else {
        return `ایمیل بازنشانی قبلاً ارسال شده است. لطفاً ${minutes} دقیقه دیگر دوباره تلاش کنید.`;
      }
    }

    // Static mapped errors
    if (errorMessages[key]) {
      return language === "en" ? errorMessages[key].en : (errorMessages[key].fa || errorMessages[key].en);
    }

    // Fallback → show raw backend message
    return key;
  };

  // Handle form submission
  const onsubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setEmailStatusKey("Please enter a valid email address!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.status === 200) {
        if (data.reset === "successful") {
          localStorage.setItem("resetPasswordToken", data.token);
          setEmail("");
          setEmailStatusKey("");
          setIsModalVisible(true);
        } else {
          setEmailStatusKey(data.error || "Internal server error.");
        }
      } else {
        setEmailStatusKey(data.error || response.statusText);
      }
    } catch (error) {
      console.error(error);
      setEmailStatusKey("Internal server error.");
    }

    setIsLoading(false);
  };

  return (
    <main dir={language === 'en' ? 'ltr' : 'rtl'}>
      {/* Success Alert */}
      <AuthAlert
        title={language === "en" ? "Reset Password" : "بازنشانی رمز عبور"}
        alertText={language === "en" 
          ? "An email has been sent to you with instructions on how to reset your password." 
          : "یک ایمیل با دستورالعمل‌های بازنشانی رمز عبور برای شما ارسال شده است."}
        buttonText={language === "en" ? "Log In" : "ورود"}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <div className="authentication">
        <div className="container-fluid">
          <div className="row align-items-stretch">
            <div className="col-12 col-lg-5 halfForgot d-flex justify-content-center">
              <p className="halfForgot_title">
                {language === "en" 
                  ? "Continue with your personalized health journey today" 
                  : "امروز مسیر شخصی‌سازی‌شده سلامتی‌ات رو ادامه بده."
                }
              </p>
            </div>

            <div id="forgot-password" className="col-12 col-lg-7 mt-4 mt-lg-0">
              <form onSubmit={onsubmit} noValidate>
                <img src={"./images/Logo.png"} alt="logo" className="auth-logo"/>

                <div className="mb-4">
                  <label htmlFor="emailInput" className="form-label">
                    {language === "en" ? "Email" : "ایمیل"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    id="emailInput"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary PassForgot auth-submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  disabled={isLoading}
                  aria-disabled={isLoading}
                >
                  {isLoading 
                    ? <PuffLoader size={25} color="#fff" cssOverride={{ marginBottom: "0px" }}/>
                    : (language === "en" ? "Reset Password →" : "بازنشانی رمز عبور ←")}
                </button>

                {/* Show translated error only if exists */}
                {emailStatusKey && (
                  <p className="forgotpassword-status text-danger" aria-live="polite">
                    {translateError(emailStatusKey)}
                  </p>
                )}

                <div className="bottomText form-text">
                  {language === "en" ? "Don't have an account?" : "حساب کاربری ندارید؟"}{" "}
                  <Link to="/register">
                    {language === "en" ? "Sign up" : " ثبت نام"}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
