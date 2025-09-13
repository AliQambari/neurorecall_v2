import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import DonutChart from 'react-donut-chart';
import './Result.css';
import { useLanguage } from './LanguageContext';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    // correct_words,
    round_completed
  } = state || {};

  const { language } = useLanguage();

  // parse URL to compute next path
  const [nextPath, setNextPath] = useState('/');

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const t = Number(parts[3]);
    const r = Number(parts[4]);

    if (!isNaN(t) && !isNaN(r)) {
      if (r < 5) setNextPath(`/profile/tests/${t}/${r + 1}`);
      else setNextPath('/profile/tests');
    }
    console.log(t, r);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  if (!state) {
    return <p>
      {language === "en" ? "Error: no result data" : "خطا: داده ای برای نتایج یافت نشد."}
    </p>;
  }

  // const percent = Math.round((correct_words / 16) * 100);

  const testNum = Number(window.location.pathname.split('/')[3]);
  const roundNum = Number(window.location.pathname.split('/')[4]);

  return (
    <div className="resultPage">
      <div className="tests">
        <div className="container py-5">
          <div className="row pb-5" style={{display: "flex", justifyContent: "center"}}>
            <div className="col-md-6">
              <div className="results mb-3 py-5 text-center">
                <h3 className="pb-4">
                  {language === "en" ? `Test ${testNum} Round ${roundNum} Result` :
                   `نتیجه تست ${testNum} دور ${roundNum}`}
                </h3>
                {!round_completed ?
                <h6 className={`text-muted pb-2 mx-3 ${language === "en" ? "lh-md" : "lh-lg"}`} style={{whiteSpace: "pre-line"}}>
                  {language === "en" ? 
                    `You have finished this round. 
                    \nClick "Next Round" to begin round ${roundNum + 1}` 
                    : `شما این دور را به اتمام رساندید.
                    روی گزینه «دور بعدی» کلیک کنید تا دور  ${roundNum + 1} ام آغاز شود.`
                  }
                </h6> : 
                <h6 className={`text-muted pb-2 mx-3 ${language === "en" ? "lh-md" : "lh-lg"}`} style={{whiteSpace: "pre-line"}}>
                  {language === "en" ? 
                    `‌You have finished test ${testNum}. You can see the results in your profile page.` 
                    : `شما این آزمون را به اتمام رساندید.
                    می توانید نتایج آزمون را در صفحه پروفایل خود مشاهده کنید.`
                  }
                </h6> 
                }
              </div>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn cardBtn px-5 py-2"
                  onClick={() => { navigate(nextPath); }}
                  disabled={round_completed}
                >
                  {round_completed ? (language === "en" ? "Finish" : "پایان") :
                   (language === "en" ? "Next Round" : "دور بعدی")}
                </button>
                {round_completed && 
                <button
                  className="btn cardBtn px-5 py-2"
                  onClick={() => { navigate('/profile'); }}
                >
                  {(language === "en" ? "Go to profile" : "رفتن به پروفایل")}
                </button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}