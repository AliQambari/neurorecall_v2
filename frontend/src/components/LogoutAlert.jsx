import { Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useLanguage } from './LanguageContext';
import "../styles/LogoutAlert.css";

function LogoutAlert({ alertText, buttonText, isVisible, onClose }) {
  //const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setLogged } = useContext(AuthContext);
  const { language } = useLanguage();

  const logoutHandler = async (e) => {
    e.preventDefault();

    //setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout");
      if (response.status === 200) {
        const data = await response.json();
        if (data.logoutStatus === "1") {
          setLogged(false);
          onClose(); // close modal
          navigate('/login', true)
        }
      } else {
        console.log(response.statusText);
      }
    } catch (error) {
      console.log(error);
    }
    //setIsLoading(false);
  }

  return (
    <Fragment>
      {/* Backdrop */}
      {isVisible && <div className="modal-backdrop fade show"></div>}
      <div
        className={`modal fade ${isVisible ? "show d-block" : "d-none"}`}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden={!isVisible}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header modal-header-container">
              <h5 className="modal-title">
                {language === "en" ? "Log Out" : "خروج از حساب کاربری" }
              </h5>
              <button
                type="button"
                className="close-button"
                onClick={onClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">{alertText}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ marginInlineEnd: "0.5rem", marginBottom: "2rem" }}
              >
                {language === "en" ? "Close" : "انصراف" } 
              </button>
              <button 
                onClick={(e) => logoutHandler(e)}
                type="button" 
                className="btn btn-primary" 
                data-bs-dismiss="modal"
                style={{ marginInlineEnd: "1rem", marginBottom: "2rem" }}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default LogoutAlert;
