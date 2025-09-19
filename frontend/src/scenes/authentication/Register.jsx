import React, { useState, useEffect, Fragment } from "react";
import "../../styles/Authentication.css";
import { useNavigate, Link } from "react-router-dom";
import PuffLoader from "react-spinners/PuffLoader";
import { useLanguage } from '../../components/LanguageContext';

export default function Register() {
  // Form states
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checked, setChecked] = useState(false);

  // UI states
  const [registerStatus, setRegisterStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // "error", "success", "info"
  const [isLoading, setIsLoading] = useState(false);

  // Keep a bilingual payload so status can react to language changes
  const [registerStatusPayload, setRegisterStatusPayload] = useState(null); // { en: string|string[], fa: string|string[] }

  // Real-time validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasDigit: false,
    hasSpecialChar: false,
    noSpaces: true
  });

  const { language } = useLanguage();
  const navigate = useNavigate();

  // Helper: bilingual wrapper
  const L = (en, fa) => ({ en, fa });

  // Helper: format messages (string or array) into bullet list string
  const formatForDisplay = (messages) => {
    if (Array.isArray(messages)) {
      return messages.map((msg) => `• ${msg}`).join('\n');
    }
    if (typeof messages === 'string' && messages.includes('\n')) {
      return messages.split('\n').map((m) => `• ${m}`).join('\n');
    }
    return messages;
  };

  // When language changes, update the visible status text from the bilingual payload
  useEffect(() => {
    if (registerStatusPayload) {
      const next = formatForDisplay(registerStatusPayload[language] || "");
      setRegisterStatus(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, registerStatusPayload]);

  // Real-time password validation
  const checkPasswordRealtime = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noSpaces: !/\s/.test(password)
    });
  };

  // useEffect for real-time validation
  useEffect(() => {
    if (password) {
      checkPasswordRealtime(password);
    }
  }, [password]);

  // Password Requirements Component
  const PasswordRequirements = ({ validation, language }) => {
    const requirements = [
      { key: 'minLength', text: language === "en" ? "At least 8 characters" : "حداقل ۸ کاراکتر" },
      { key: 'hasLowercase', text: language === "en" ? "One lowercase letter" : "یک حرف کوچک" },
      { key: 'hasUppercase', text: language === "en" ? "One uppercase letter" : "یک حرف بزرگ" },
      { key: 'hasDigit', text: language === "en" ? "One digit" : "یک عدد" },
      { key: 'hasSpecialChar', text: language === "en" ? "One special character" : "یک کاراکتر ویژه" },
      { key: 'noSpaces', text: language === "en" ? "No spaces" : "بدون فاصله" }
    ];

    return (
      <div className="password-requirements">
        {requirements.map(req => (
          <div 
            key={req.key} 
            className={`requirement ${validation[req.key] ? 'valid' : 'invalid'}`}
          >
            <span className="icon">
              {validation[req.key] ? '✓' : '✗'}
            </span>
            {req.text}
          </div>
        ))}
      </div>
    );
  };

  // Complete Persian translation for all error messages
  const getErrorMessage = (backendError, language) => {
    if (language === "fa") {
      const persianTranslations = {
        // Registration validation errors
        "Username, email, and password are required": "نام کاربری، ایمیل و رمز عبور ضروری هستند",
        "Username and password required": "نام کاربری و رمز عبور ضروری هستند",
        "Username or email too long": "نام کاربری یا ایمیل خیلی طولانی است",
        "Username must be between 3 and 50 characters": "نام کاربری باید بین ۳ تا ۵۰ کاراکتر باشد",
        "Email must be between 5 and 100 characters": "ایمیل باید بین ۵ تا ۱۰۰ کاراکتر باشد",
        "Invalid email format": "فرمت ایمیل نادرست است",
        "User already exists": "کاربری با این مشخصات وجود دارد",
        
        // Age validation errors
        "Age must be between 13 and 120": "سن باید بین ۱۳ تا ۱۲۰ سال باشد",
        "Invalid age format": "فرمت سن نادرست است",
        "Age is required": "وارد کردن سن ضروری است",
        
        // Password validation errors
        "Password must be at least 8 characters long": "رمز عبور باید حداقل ۸ کاراکتر باشد",
        "Password must contain at least one lowercase letter": "رمز عبور باید حداقل یک حرف کوچک داشته باشد",
        "Password must contain at least one uppercase letter": "رمز عبور باید حداقل یک حرف بزرگ داشته باشد",
        "Password must contain at least one digit": "رمز عبور باید حداقل یک عدد داشته باشد",
        "Password must contain at least one special character": "رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد",
        "Password cannot contain spaces": "رمز عبور نمی‌تواند فاصله داشته باشد",
        "Password is too common": "رمز عبور خیلی ساده است",
        "Password must not contain username": "رمز عبور نباید شامل نام کاربری باشد",
        "Password too weak": "رمز عبور خیلی ضعیف است",
        
        // Input validation errors
        "Invalid input length": "طول ورودی نادرست است",
        "Invalid JSON": "فرمت اطلاعات نادرست است",
        "Content-Type must be application/json": "نوع محتوا باید JSON باشد",
        
        // Rate limiting errors
        "Too many registration attempts. Please try again later.": "تلاش‌های زیادی برای ثبت‌نام انجام شده. لطفاً بعداً تلاش کنید",
        "Too many requests. Please try again later.": "درخواست‌های زیادی ارسال شده. لطفاً بعداً تلاش کنید",
        "Rate limit exceeded": "از حد مجاز درخواست عبور کرده‌اید",
        
        // Server errors
        "Internal server error": "خطای داخلی سرور",
        "Database error": "خطای پایگاه داده",
        "Server temporarily unavailable": "سرور موقتاً در دسترس نیست",
        
        // Network/Generic errors
        "Registration failed": "ثبت‌نام ناموفق بود",
        "Registration failed. Please try again.": "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید",
        "Please check your information and try again": "لطفاً اطلاعات خود را بررسی کنید و دوباره تلاش کنید",
        
        // Gender validation
        "Invalid gender selection": "انتخاب جنسیت نادرست است",
        "Gender is required": "انتخاب جنسیت ضروری است",
        
        // Username validation
        "Username must contain only letters, numbers, and underscores": "نام کاربری فقط می‌تواند شامل حروف، اعداد و خط زیر باشد",
        "Username cannot start with a number": "نام کاربری نمی‌تواند با عدد شروع شود",
        "Username is already taken": "این نام کاربری قبلاً گرفته شده است",
        
        // Email validation
        "Email is already registered": "این ایمیل قبلاً ثبت شده است",
        "Email domain is not allowed": "دامنه ایمیل مجاز نیست",
        "Email verification failed": "تایید ایمیل ناموفق بود"
      };
      
      return persianTranslations[backendError] || backendError;
    }
    
    // For English, use backend error message as-is
    return backendError;
  };

  // New: bilingual backend error message helper (kept original getErrorMessage; this adds i18n payload)
  const getErrorMessageIntl = (backendError) => {
    const fa = getErrorMessage(backendError, "fa");
    return L(backendError, fa);
  };

  // New: bilingual password validation (kept original function above; this returns EN/FA pairs)
  const validatePasswordIntl = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push(L(
        "Password must be at least 8 characters long",
        "رمز عبور باید حداقل ۸ کاراکتر باشد"
      ));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(L(
        "Password must contain at least one lowercase letter",
        "رمز عبور باید حداقل یک حرف کوچک داشته باشد"
      ));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(L(
        "Password must contain at least one uppercase letter",
        "رمز عبور باید حداقل یک حرف بزرگ داشته باشد"
      ));
    }
    if (!/\d/.test(password)) {
      errors.push(L(
        "Password must contain at least one digit",
        "رمز عبور باید حداقل یک عدد داشته باشد"
      ));
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(L(
        "Password must contain at least one special character",
        "رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد"
      ));
    }
    if (/\s/.test(password)) {
      errors.push(L(
        "Password cannot contain spaces",
        "رمز عبور نمی‌تواند فاصله داشته باشد"
      ));
    }
    return errors;
  };

  // New: bilingual status setter that also enables live language switching
  const displayStatusIntl = (messagesIntl, type = "error") => {
    // Normalize to { en: string[]|string, fa: string[]|string }
    let payload = { en: "", fa: "" };

    // Array of bilingual entries
    if (Array.isArray(messagesIntl) && messagesIntl.every(m => typeof m === 'object' && m.en && m.fa)) {
      payload = {
        en: messagesIntl.map(m => m.en),
        fa: messagesIntl.map(m => m.fa)
      };
    }
    // Single bilingual entry
    else if (messagesIntl && typeof messagesIntl === 'object' && messagesIntl.en && messagesIntl.fa) {
      payload = {
        en: messagesIntl.en,
        fa: messagesIntl.fa
      };
    }
    // Fallback: single string used for both languages
    else {
      payload = { en: messagesIntl, fa: messagesIntl };
    }

    setRegisterStatusPayload(payload);
    setStatusType(type);

    // Also set immediate visible status for current language
    setRegisterStatus(formatForDisplay(payload[language]));

    if (type === "success") {
      setTimeout(() => {
        setRegisterStatus("");
        setStatusType("");
        setRegisterStatusPayload(null);
      }, 3000);
    }
  };

  // Complete client-side validation
  const validateForm = () => {
    const allErrors = [];

    // validate username
    if (username.trim().length < 3) {
      allErrors.push(
        L("Username must be at least 3 characters", "نام کاربری باید حداقل ۳ کاراکتر باشد.")
      );
    }
    
    if (username.trim().length > 50) {
      allErrors.push(
        L("Username must be less than 50 characters", "نام کاربری باید کمتر از ۵۰ کاراکتر باشد.")
      );
    }

    // validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      allErrors.push(
        L("Please enter a valid email address", "لطفاً یک آدرس ایمیل معتبر وارد کنید.")
      );
    }

    // validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      allErrors.push(
        L("Age must be between 13 and 120", "سن باید بین ۱۳ تا ۱۲۰ سال باشد.")
      );
    }

    // validate gender choice
    if (!gender) {
      allErrors.push(
        L("Please select a gender", "لطفاً جنسیت خود را انتخاب کنید.")
      );
    }

    // validate password (bilingual)
    const passwordErrorsIntl = validatePasswordIntl(password);
    allErrors.push(...passwordErrorsIntl);

    // validate password matching
    if (password !== confirmPassword) {
      allErrors.push(
        L("Passwords do not match!", "رمزهای عبور با هم مطابقت ندارند!")
      );
    }

    // validate terms and conditions
    if (!checked) {
      allErrors.push(
        L("You must agree to the terms and conditions", "باید شرایط و قوانین را قبول کنید.")
      );
    }

    // display all errors
    if (allErrors.length > 0) {
      displayStatusIntl(allErrors, "error");
      return false;
    }

    return true;
  };

  // Clear form
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setAge("");
    setChecked(false);
    setConfirmPassword("");
    setGender("");
  };

  const onsubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous status
    setRegisterStatus("");
    setStatusType("");
    setRegisterStatusPayload(null);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          age: parseInt(age),
          sex: gender
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      // Handle different response scenarios
      if (response.status === 201 && data.register === "successful") {
        // Registration successful
        displayStatusIntl(
          L(
            "Registration successful! Redirecting to login...",
            "ثبت‌نام موفقیت‌آمیز بود! در حال انتقال به صفحه ورود..."
          ),
          "success"
        );
        
        clearForm();
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: language === "en" 
                ? "Account created successfully! Please log in." 
                : "حساب با موفقیت ایجاد شد! لطفاً وارد شوید."
            }
          });
        }, 1500);
        
      } else if (response.status === 400 && data.register === "failed") {
        // Use backend error message directly (bilingual)
        const backendError = data.error || "Registration failed";
        displayStatusIntl(getErrorMessageIntl(backendError), "error");
        
      } else if (response.status === 429) {
        // Rate limiting
        displayStatusIntl(
          L(
            "Too many registration attempts. Please try again later.",
            "تلاش‌های زیادی برای ثبت‌نام. لطفاً بعداً تلاش کنید."
          ),
          "error"
        );
        
      } else if (response.status >= 500) {
        // Server errors
        displayStatusIntl(
          L(
            "Server error. Please try again later.",
            "خطای سرور. لطفاً بعداً تلاش کنید."
          ),
          "error"
        );
        
      } else {
        // For any other error, use backend message directly
        const backendError = data.error || "Registration failed. Please try again.";
        displayStatusIntl(getErrorMessageIntl(backendError), "error");
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Network or other errors
      displayStatusIntl(
        L(
          "Network error. Please check your connection and try again.",
          "خطای شبکه. لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید."
        ),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get status message class for styling
  const getStatusClass = () => {
    const baseClass = "register-status";
    if (statusType === "error") return `${baseClass} error`;
    if (statusType === "success") return `${baseClass} success`;
    if (statusType === "info") return `${baseClass} info`;
    return baseClass;
  };
  
  return (
    <Fragment>
      <div className="authentication" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="container-fluid">
          <div className="row auth-row">
            <div className="col-12 col-lg-5 halfRegister d-flex justify-content-center">
              <p className="halfRegister_title">
                {language === "en" ? "Get started with your personalized health journey today" : 
                  "امروز مسیر شخصی‌سازی‌شده سلامتی‌ات را آغاز کن."
                }
              </p>
            </div>
            <div className="col-12 col-lg-6">
              <form id="register" className="row" onSubmit={onsubmit} noValidate>
                <div className="col-12 pt-4 pt-lg-5 text-center">
                  <img className="auth-logo" src={"./images/Logo.png"} alt="logo" />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="userName" className="form-label">
                    {language === "en" ? "Username" : "نام کاربری" }
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    id="userName"
                    maxLength="50"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="Age" className="form-label">
                    {language === "en" ? "Age" : "سن" }
                  </label>
                  <input
                    type="number"
                    onChange={(e) => setAge(e.target.value)}
                    value={age}
                    min={13}
                    max={120}
                    className="form-control"
                    id="Age"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4" className="form-label">
                    {language === "en" ? "Email" : "ایمیل" }
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    id="inputEmail4"
                    maxLength="100"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="Gender" className="form-label">
                    {language === "en" ? "Gender" : "جنسیت" }
                  </label>
                  <br />
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      id="inlineRadio1"
                      value="male"
                      onChange={(e) => setGender(e.target.value)}
                      checked={gender === "male"}
                      required
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="inlineRadio1">
                      {language === "en" ? "M" : "مرد" }
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      id="inlineRadio2"
                      value="female"
                      checked={gender === "female"}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="inlineRadio2">
                      {language === "en" ? "F" : "زن" }
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      id="inlineRadio3"
                      value="none"
                      checked={gender === "none"}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="inlineRadio3">
                      {language === "en" ? "None" : "هیچکدام" }
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputPassword4" className="form-label">
                    {language === "en" ? "Password" : "رمز عبور" }
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    id="inputPassword4"
                    maxLength="200"
                    required
                    disabled={isLoading}
                  />
                  
                  {/* Real-time password requirements */}
                  {password && (
                    <PasswordRequirements 
                      validation={passwordValidation} 
                      language={language} 
                    />
                  )}
                </div>
                
                <div className="col-md-6 mb-4">
                  <label htmlFor="inputPassword3" className="form-label">
                    {language === "en" ? "Confirm Password" : "تایید رمز عبور" }
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control confirm-password"
                    id="inputPassword3"
                    required
                    disabled={isLoading}
                  />
                  {/* Show password match status */}
                  {confirmPassword && password && (
                    <small 
                      className={`${
                        password === confirmPassword ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {password === confirmPassword 
                        ? (language === "en" ? "✓ Passwords match" : "✓ رمزها مطابقت دارند")
                        : (language === "en" ? "✗ Passwords don't match" : "✗ رمزها مطابقت ندارند")
                      }
                    </small>
                  )}
                </div>

                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="form-check-input"
                    id="exampleCheck1"
                    required
                    disabled={isLoading}
                  />
                  <label className="form-check-label" htmlFor="exampleCheck1">
                    {language === "en" ? `I agree to these ${" "}` : "من با " }
                    <a className="terms" href="/terms" target="_blank" rel="noopener noreferrer">
                      {language === "en" ? "terms and conditions" : "شرایط و قوانین " }
                    </a>
                    {language === "en" ? "." : "موافقت می کنم."}
                  </label>
                </div>
                
                {/* Status message with proper styling */}
                {registerStatus && (
                  <div className="col-12 mb-2">
                    <div className={getStatusClass()} role="status" aria-live="polite">
                      {registerStatus}
                    </div>
                  </div>
                )}
                
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary signUpBtn auth-submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <PuffLoader size={25} color="#fff" cssOverride={{ marginBottom: "0px" }}/>
                    ) : (
                      language === "en" ? "Sign Up →" : "ثبت نام ←"
                    )}
                  </button>
                </div>
                
                <div className="bottomText form-text col-12">
                  {language === "en" ? "Already have an account?" : "حساب کاربری دارید؟"}{" "}
                  <Link to="/login">
                    {language === "en" ? "Sign in" : "ورود"}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
