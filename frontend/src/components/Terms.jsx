import React from "react";
import "../styles/Terms.css";
import { useLanguage } from './LanguageContext';
import { LuShieldCheck, LuMic, LuFileCheck } from "react-icons/lu";

export default function Terms() {
  const { language } = useLanguage();
  const t = (en, fa) => (language === "en" ? en : fa);
  const dir = language === "en" ? "ltr" : "rtl";

  const terms = [
    {
      icon: <LuMic aria-hidden />,
      title: t("I agree to my voice being recorded.", "موافقت می کنم که صدایم ضبط شود."),
      desc: t(
        "Your voice will be captured to analyze recall performance.",
        "صدای شما جهت تحلیل عملکرد حافظه ضبط می‌شود."
      ),
    },
    {
      icon: <LuFileCheck aria-hidden />,
      title: t(
        "I agree to my voice used as test voice in future.",
        "موافقت می کنم که صدایم به عنوان تست در آینده مورد استفاده قرار بگیرد."
      ),
      desc: t(
        "Your recordings may help improve test quality and calibration.",
        "ضبط‌های شما می‌تواند به بهبود کیفیت و کالیبراسیون تست کمک کند."
      ),
    },
  ];

  return (
    <main className="terms-page" dir={dir}>
      <div className="container TermsandConditions">
        <section className="terms-card" aria-label={t('Terms and conditions', 'شرایط و قوانین')}>
          <header className="terms-header">
            <h1 className="terms-title">{t('Terms & Conditions', 'شرایط و قوانین')}</h1>
            <p className="terms-subtitle">
              {t('Please review the terms before continuing.', 'لطفاً قبل از ادامه، شرایط را مرور کنید.')}
            </p>
          </header>

          {/* Keep list semantics for accessibility */}
          <ul className="terms-list">
            {terms.map((item, idx) => (
              <li key={idx} className="terms-item">
                <div className="term-icon" aria-hidden>{item.icon}</div>
                <div className="term-content">
                  <h3 className="term-title">{item.title}</h3>
                  <p className="term-desc">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="terms-hint" role="note">
            <LuShieldCheck aria-hidden />
            <span>
              {t(
                'We protect your privacy. See our policy in the footer.',
                'حریم خصوصی شما برای ما مهم است.'
              )}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

