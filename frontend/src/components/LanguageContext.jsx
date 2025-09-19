import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or default to "en"
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "en";
  });

  const direction = language === "fa" ? "rtl" : "ltr";
  const fontFamily = language === "fa" ? "Vazirmatn" : "Montserrat";
  const letterSpacing = language === "fa" ? "normal" : "1.4px";

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fa" : "en"));
  };

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, direction, fontFamily, letterSpacing }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
