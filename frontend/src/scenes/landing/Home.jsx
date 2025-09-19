import React, { useContext } from "react";
import "../../styles/Home.css";
import { AuthContext } from "../../components/AuthContext";
import { useLanguage } from '../../components/LanguageContext';
import { GiBrain } from "react-icons/gi";
import { BsClipboard2DataFill } from "react-icons/bs";
import { FaHeadSideVirus } from "react-icons/fa6";
import { Link } from "react-router-dom";




export default function Home() {
  const { logged } = useContext(AuthContext);
  const { language } = useLanguage();

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="pb-2 mb-5">
            {language === "en" ? "Take control of your" : "کنترل مسیر سلامتی خود را"}
            <br />
            {language === "en" ? "health journey" : "به دست بگیرید!"}
          </h1>
          <h3 className="pb-2" style={{lineHeight: "2rem"}}>
            {language === "en" ? "Test your verbal learning and gain confidence" : "قدرت حافظه خود را بسنجید"}
            <br />
            {language === "en" ? "in your healthcare decisions" : "و با اطمینان بیشتری درباره سلامتی خود تصمیم بگیرید!"}
          </h3>

          {logged ? (
            <Link
              className={`btn btn-primary px-4 navbarBtn mt-3`}
              aria-current="page"
              to="/profile/tests"
            >
              {language === "en" ? "Go to Tests →" : "رفتن به آزمون‌ها →"}
            </Link>
          ) : (
            <Link
              className={`btn btn-primary px-4 navbarBtn mt-3`}
              aria-current="page"
              href="/register"
            >
              {language === "en" ? "Register →" : "ثبت نام →"}
            </Link>
          )}
        </div>
      </div>

      <div id="section1">
        <div className="container py-5">
          <div className="row">
            {/* Text Section */}
            <div className="col-12 col-md-6 pe-md-5 mb-4 mb-md-0">
              <div className="boderDiv"></div>
              <h2>
                {language === "en" ? "Our Tests Evaluate Your Verbal Learning And More" : "آزمایش‌های ما توانایی حافظه‌ شما را در به‌خاطر سپردن کلمات ارزیابی می‌کنند."}
              </h2>
              <p>
                {language === "en" ? "Beside Evaluating you verbal learning, our tests can be a valuable tool for improving cognitive skills, enhancing learning strategies, and achieving academic success." 
                : "علاوه‌ بر سنجش حافظه‌ شما برای به‌خاطر سپردن کلمات، آزمون‌های ما می‌توانند ابزار ارزشمندی برای تقویت مهارت‌های ذهنی، بهبود روش‌های یادگیری و موفقیت در درس و تحصیل باشند."}
              </p>
            </div>
            {/* Feature Cards Section */}
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12 col-sm-6 mb-4">
                  <div className="feature-card">
                    <div className="feature-card__icon">
                      <FaHeadSideVirus size={25}/>
                    </div>
                    <p className="feature-card__title">
                      {language === "en" ? "Improved Memory and Learning" : "بهبود حافظه و یادگیری"}                      
                    </p>
                    <div className="feature-card__separator"></div>
                    <p className="feature-card__description">
                      {language === "en" ? "Tests improve memory by strengthening the neural pathways" : "آزمون‌ها با تقویت مسیرهای عصبی، باعث بهبود حافظه می‌شوند."}
                    </p>
                  </div>
                </div>
                
                <div className="col-12 col-sm-6 mb-4">
                  <div className="feature-card">
                    <div className="feature-card__icon">
                      <BsClipboard2DataFill size={25}/>
                    </div>
                    <p className="feature-card__title">
                      {language === "en" ? "Identification of Knowledge Gaps" : "شناسایی نقاط ضعف در حافظه و یادگیری" }
                    </p>
                    <div className="feature-card__separator"></div>
                    <p className="feature-card__description">
                      {language === "en" ? "You can identify your strong areas and areas that can be improved" : "می‌توانید بخش‌هایی از حافظه‌ خود را که قوی هستند بشناسید و قسمت‌هایی را که نیاز به تقویت دارند، مشخص کنید."}
                    </p>
                  </div>
                </div>

                <div className="col-12 mb-4">
                  <div className="feature-card">
                    <div className="feature-card__icon">
                      <GiBrain size={30}/>
                    </div>
                    <p className="feature-card__title">
                      {language === "en" ? "Inhanced Cognitive Function" : "بهبود توانایی‌های شناختی" }
                    </p>
                    <div className="feature-card__separator"></div>
                    <p className="feature-card__description">
                      {language === "en" ? "Regular engagement in tests can improve processing speed" : "شرکت منظم در آزمون‌ها می‌تواند سرعت پردازش ذهن را افزایش دهد." }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="section2">
        <div className="container">
          <div className="row gap-2">
            <div className="col">
              <h1>4</h1>
              <h4>
                {language === "en" ? "Test rounds" : "مراحل آزمون"}
              </h4>
            </div>
            <div className="col">
              <h1>5</h1>
              <h4>
                {language === "en" ? "Separate tests" : "آزمون جداگانه"}
              </h4>
            </div>
            <div className="col">
              <h1>80+</h1>
              <h4>
                {language === "en" ? "Percent doctor approved" : "درصد تأیید پزشکان"}
              </h4>
            </div>
            <div className="col">
              <h1>1M+</h1>
              <h4>
                {language === "en" ? "People taken tests" : "افرادی که در این آزمون‌ها شرکت کرده‌اند"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div id="section3">
        <h4>
          {language === "en" ? "Expert Opinions on California Verbal learning Test Functionality and benefits" 
          : "نظر کارشناسان درباره عملکرد و فواید آزمون کلامی کالیفرنیا"}
          
        </h4>
        <div className="container">
          <div className="row g-4 d-flex justify-content-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="testimonial">
                <p className="testimonial__text">
                  {language === "en" ?
                  "The CVLT is a versatile test that can be used to assess a variety of aspects of verbal learning and memory, including encoding, storage, and retrieval"
                  : "آزمون CVLT یک ابزار چندمنظوره است که می‌تواند جنبه‌های مختلفی از یادگیری و حافظه کلامی، از جمله رمزگذاری، ذخیره‌سازی و بازیابی اطلاعات را ارزیابی کند." }
                </p>
                <div>
                  <p className="testimonial__name">Dr. Peter Jones</p>
                  <p className="testimonial__job">{language === "en" ? "Neuropsychologist" : "متخصص مغز و اعصاب"}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="testimonial">
                <p className="testimonial__text">
                  {language === "en" ? "The CVLT is a well-stablished and reliable test of verbal learning and memory. It is a valuable tool for assessing cognitive function."
                  : "آزمون CVLT یک روش شناخته‌شده و قابل‌اعتماد برای سنجش یادگیری و حافظه کلامی است. این آزمون ابزار ارزشمندی برای ارزیابی عملکرد شناختی مغز به شمار می‌آید." }
                </p>
                <div>
                  <p className="testimonial__name">Dr. Mary Smith</p>
                  <p className="testimonial__job">{language === "en" ? "Neuropsychologist" : "متخصص مغز و اعصاب"}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="testimonial">
                <p className="testimonial__text">
                  {language === "en" ? "The CVLT is a well-normed test that can be used to compare an individual's performance to that of others in their age group." 
                  : "آزمون CVLT بر اساس داده‌های دقیق استانداردسازی شده و این امکان را فراهم می‌کند که عملکرد هر فرد با دیگران در گروه سنی خودش مقایسه شود." }
                </p>
                <div>
                  <p className="testimonial__name">Dr. Susan Brown</p>
                  <p className="testimonial__job">{language === "en" ? "Neuropsychologist" : "متخصص مغز و اعصاب"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="footer">
        <div className="container">
          <div className="row">
            <div className="col-4">
              <h4>{language === "en" ? "Fast Access" : "دسترسی سریع"}</h4>
              <Link to="/">{language === "en" ? "Home" : "خانه"}</Link>
            </div>
            <div className="col-4">
              <h4>{language === "en" ? "Resources" : "منابع"}</h4>
              <a
                href="https://www.pearsonassessments.com/"
                target="_blank"
                rel="noreferrer"
              >
                Pearson Assessments
              </a>
            </div>
            <div className="col-4">
              <h4>{language === "en" ? "Get in Touch" : "با ما در تماس باشید"}</h4>
              <i>
                <img src={"./images/GPS.png"} alt="gps" />
              </i>{" "}
              <a
                className="footerATag"
                href="https://iut.ac.ir"
                target="_blank"
                rel="noreferrer"
              >
                {language === "en" ? "Isfahan University of Technology" : "دانشگاه صنعتی اصفهان"}
              </a>
              <div></div>
              <i>
                <img src={"./images/Email.png"} alt="mail" />
              </i>{" "}
              <a
                className="footerATag"
                href="mailto:neurorecall@outlook.com"
                target="_blank"
                rel="noreferrer"
              >
                neurorecall@outlook.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
