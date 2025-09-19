import React, { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import "../../styles/Authentication.css";
import AuthAlert from "../../components/AuthAlert";
import PuffLoader from "react-spinners/PuffLoader";
import { useLanguage } from '../../components/LanguageContext';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // UI States
    const [resetPasswordStatus, setResetPasswordStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [statusType, setStatusType] = useState(""); // "error", "success", "info"

    // Keep a bilingual payload so status can react to language changes
    const [resetPassStatusPayload, setResetPassStatusPayload] = useState(null); // { en: string|string[], fa: string|string[] }

    const { token } = useParams();
    const { language } = useLanguage();

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
        if (resetPassStatusPayload) {
            const next = formatForDisplay(resetPassStatusPayload[language] || "");
            setResetPasswordStatus(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, resetPassStatusPayload]);

    // Real-time validation state
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasDigit: false,
        hasSpecialChar: false,
        noSpaces: true
    });

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
        if (newPassword) {
            checkPasswordRealtime(newPassword);
        }
    }, [newPassword]);

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

            // Reset password errors
            "Invalid password reset token!" : "توکن بازنشانی پسورد اشتباه است!",
            "Password reset token has expired!" : "توکن بازنشانی پسورد منقضی شده است!",
            "Passwords do not match!" : "رمز های عبور با هم مطابقت ندارند!",
            "Something went wrong!" : "خطایی رخ داد!",

            // Other errors
            "Network or server error!" : "خطا در سرور یا شبکه",
            "Unknown error": "خطای ناشناخته"
        };
        
        return persianTranslations[backendError] || backendError;
        }
        
        // For English, use backend error message as-is
        return backendError;
    };

    // bilingual backend error message helper (kept original getErrorMessage; this adds i18n payload)
    const getErrorMessageIntl = (backendError) => {
        const fa = getErrorMessage(backendError, "fa");
        return L(backendError, fa);
    };

    // bilingual password validation (kept original function above; this returns EN/FA pairs)
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

        setResetPassStatusPayload(payload);
        setStatusType(type);

        // Also set immediate visible status for current language
        setResetPasswordStatus(formatForDisplay(payload[language]));
    };

    // Complete client-side validation
    const validateForm = () => {
        const allErrors = [];

        // validate password (bilingual)
        const passwordErrorsIntl = validatePasswordIntl(newPassword);
        allErrors.push(...passwordErrorsIntl);

        // validate password matching
        if (newPassword !== confirmNewPassword) {
            allErrors.push(
                L("Passwords do not match!", "رمزهای عبور با هم مطابقت ندارند!")
            );
        }

        // display all errors
        if (allErrors.length > 0) {
            displayStatusIntl(allErrors, "error");
            return false;
        }

        return true;
    };

    const onsubmit = async (event) => {
        event.preventDefault();

        // Client-side validation
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        // Clear previous status
        setResetPasswordStatus("");
        setStatusType("");
        setResetPassStatusPayload(null);

        try {
            const response = await fetch(`/api/auth/password-reset/${token}`, {
                method: 'POST',
                body: JSON.stringify({
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.status === 200) {
                if (data.reset === "successful") {
                    setIsModalVisible(true);
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setResetPasswordStatus("");
                } else {
                    displayStatusIntl(getErrorMessageIntl("Unknown error"), "error");
                }
            } else {
                if (data.reset === "invalidToken") {
                    displayStatusIntl(getErrorMessageIntl("Invalid password reset token!"), "error");
                } else if (data.reset === "expiredToken") {
                    displayStatusIntl(getErrorMessageIntl("Password reset token has expired!"), "error");
                } else if (data.reset === "unmatchedPasswords") {
                    displayStatusIntl(getErrorMessageIntl("Passwords do not match!"), "error");
                } else {
                    displayStatusIntl(getErrorMessageIntl("Something went wrong!"), "error");
                }
            }
        } catch (error) {
            console.error(error);
            displayStatusIntl(getErrorMessageIntl("Network or server error!"), "error");
        }

        setIsLoading(false);
    };

    // Get status message class for styling
    const getStatusClass = () => {
        const baseClass = "register-status";
        if (statusType === "error") return `${baseClass} error`;
        if (statusType === "success") return `${baseClass} success`;
        if (statusType === "info") return `${baseClass} info`;
        return `${baseClass} error`;
    };

    return (
        <main dir={language === 'en' ? 'ltr' : 'rtl'}>
            <Fragment>
                <AuthAlert
                    title={language === "en" ? "Reset Password" : "بازنشانی رمز عبور"}
                    alertText={language === "en" ? "Your password has been successfully reset." : "رمز عبور شما با موفقیت بازنشانی شد."}
                    buttonText={language === "en" ? "Sign In" : "ورود"}
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                />
                <div className="authentication">
                    <div className="container-fluid">
                        <div className="row align-items-stretch">
                            <div className="col-12 col-lg-5 half" />
                            <div id="reset-password" className="col-12 col-lg-7 mt-4 mt-lg-0"> 
                                <form onSubmit={onsubmit} noValidate>
                                    {/* Absolute path for image */}
                                    <img src="/images/Logo.png" alt="logo" className="auth-logo" />
                                    
                                    <div className="mb-4">
                                        <label htmlFor="newPassword" className="form-label">
                                            {language === "en" ? "New Password" : "رمز عبور جدید"}
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="form-control"
                                            id="newPassword"
                                            required
                                        />
                                        {/* Real-time password requirements */}
                                        {newPassword && (
                                            <PasswordRequirements 
                                            validation={passwordValidation} 
                                            language={language} 
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label htmlFor="confirmNewPassword" className="form-label">
                                            {language === "en" ? "Confirm New Password" : "تایید رمز عبور جدید"}
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            className="form-control"
                                            id="confirmNewPassword"
                                            required
                                        />
                                        {/* Show password match status */}
                                        {confirmNewPassword && newPassword && (
                                            <small 
                                            className={`${
                                                newPassword === confirmNewPassword ? 'text-success' : 'text-danger'
                                            }`}
                                            >
                                            {newPassword === confirmNewPassword 
                                                ? (language === "en" ? "✓ Passwords match" : "✓ رمزها مطابقت دارند")
                                                : (language === "en" ? "✗ Passwords don't match" : "✗ رمزها مطابقت ندارند")
                                            }
                                            </small>
                                        )}
                                    </div>
                                    
                                    {/* Status message with proper styling */}
                                    {resetPasswordStatus && (
                                    <div className="col-md-12 mb-3">
                                        <div className={getStatusClass()} role="status" aria-live="polite">
                                        {resetPasswordStatus}
                                        </div>
                                    </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary PassForgot auth-submit"
                                        disabled={isLoading}
                                        aria-disabled={isLoading}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {isLoading
                                            ? <PuffLoader size={25} color="#fff" cssOverride={{ marginBottom: "0px" }} />
                                            : language === "en" ? "Reset Password →" : "بازنشانی رمز عبور ←"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        </main>
    );
}
