import React from "react";
import "../styles/Help.css";
import { useLanguage } from './LanguageContext';
import { LuMic, LuSend } from "react-icons/lu";
import { FaPlayCircle } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";


export default function Help() {
  const { language } = useLanguage();
  const t = (en, fa) => (language === "en" ? en : fa);
  const dir = language === "en" ? "ltr" : "rtl";

  const steps = [
    {
      icon: <FaPlayCircle aria-hidden />,
      title: t("Play the audio.", "فایل صوتی را پخش کنید."),
      desc: t(
        "Listen carefully to the words in each round.",
        "در هر دور با دقت به کلمات گوش دهید."
      ),
    },
    {
      icon: <LuMic aria-hidden />,
      title: t(
        "Record your voice online or upload file.",
        "صدای خود را ضبط کرده یا فایل صدای خود را آپلود کنید."
      ),
      desc: t(
        "Use the microphone to record, or choose an existing audio file.",
        "با میکروفون ضبط کنید یا یک فایل صوتی انتخاب کنید."
      ),
    },
    {
      icon: <LuSend aria-hidden />,
      title: t(
        "Click submit to see Results.",
        "روی گزینه ثبت کلیک کرده تا نتایج را مشاهده کنید."
      ),
      desc: t(
        "Submit when you are ready and view your score instantly.",
        "پس از اطمینان ارسال کنید و نتیجه را ببینید."
      ),
    },
  ];

  return (
    <main className="help-page" dir={dir}>
      <div className="container TermsandConditions">
        <section className="help-card" aria-label={t('How to use the test', 'راهنمای استفاده از تست')}>
          <header className="help-header">
            <h1 className="help-title">{t('Help', 'راهنما')}</h1>
            <p className="help-subtitle">
              {t('Follow these 3 quick steps:', 'با این ۳ مرحلهٔ ساده پیش بروید:')}
            </p>
          </header>

          {/* Ordered list retained for accessibility */}
          <ol className="help-steps">
            {steps.map((s, idx) => (
              <li key={idx} className="help-step">
                <div className="step-index" aria-hidden>{idx + 1}</div>
                <div className="step-icon" aria-hidden>
                  {s.icon}
                </div>
                <div className="step-content">
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Optional tip row (kept subtle, improves UX) */}
          <div className="help-hint" role="note">
            <FiUploadCloud aria-hidden />
            <span>
              {t(
                'Tip: You can drag & drop an audio file into the upload box.',
                'نکته: می‌توانید فایل صوتی را بکشید و در جعبهٔ آپلود رها کنید.'
              )}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}