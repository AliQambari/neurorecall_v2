import React from "react";
import "../../styles/Tests.css";
import { Link } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';

export default function Tests() {
  const { language } = useLanguage();
  const dir = language === 'en' ? 'ltr' : 'rtl';

  const t = (en, fa) => (language === 'en' ? en : fa);

  const tests = [
    { id: 1, img: "../images/speech.png", path: "/profile/tests/1/1" },
    { id: 2, img: "../images/speech.png", path: "/profile/tests/2/1" },
    { id: 3, img: "../images/speech.png", path: "/profile/tests/3/1" },
    { id: 4, img: "../images/speech.png", path: "/profile/tests/4/1" },
  ];

  return (
    <div className="tests" dir={dir}>
      <div className="container py-5">
        <div className="row g-4">
          {tests.map((item) => (
            <div key={item.id} className="col-12 col-md-6">
              <div className="card customCard test-card h-100">
                <div className="row g-0 align-items-center">
                  <div className="col-4 col-sm-4">
                    <img
                      src={item.img}
                      className="img-fluid rounded-start test-illustration"
                      alt={t('test icon', 'آیکون تست')}
                    />
                  </div>
                  <div className="col-8 col-sm-8">
                    <div className="card-body cardbodycustom d-flex flex-column h-100">
                      <h5 className="card-title">{t('Test', 'تست')} {item.id}</h5>
                      <p className="card-text text-muted mb-3">
                        {t('5 rounds in a row; 16 words to recall.', '۵ مرحله پشت سر هم؛ ۱۶ کلمه برای به خاطر سپردن.')}
                      </p>
                      <div className="mt-auto text-end text-sm-end">
                        <Link to={item.path} className="btn cardBtn test-btn w-100 w-sm-auto">
                          {t('Start Test', 'شروع تست')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}