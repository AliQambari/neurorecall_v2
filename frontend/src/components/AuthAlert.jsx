import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "./LanguageContext";
import { AiOutlineCloseCircle } from "react-icons/ai";


function AuthAlert({ title, alertText, buttonText, isVisible, onClose }) {
  const { language } = useLanguage();

  return (
    <Fragment>
      {isVisible && (
        <div
          className={`modal fade show d-block`}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }} // backdrop
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  // className="btn-close"
                  style={{border: "none", backgroundColor: "white"}}
                  aria-label="Close"
                  onClick={onClose}
                >
                  <AiOutlineCloseCircle size={25}/>
                </button>
              </div>
              <div className="modal-body">{alertText}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginRight: "1rem", marginBottom: "2rem" }}
                  onClick={onClose}
                >
                  {language === "en" ? "Close" : "بستن"}
                </button>
                <Link to="/login" style={{ marginRight: "1rem", marginBottom: "2rem" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onClose}
                  >
                    {buttonText}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default AuthAlert;
