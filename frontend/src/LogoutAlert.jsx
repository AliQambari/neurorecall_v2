import { Fragment, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useLanguage } from './LanguageContext';
import { Modal } from 'bootstrap';

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

  useEffect(() => {
    const modalElement = document.getElementById("exampleModalCenter");
    if (!modalElement) return;

    // ✅ Use imported Modal class directly
    const modal = new Modal(modalElement);

    // Add event listener to dispose of the modal after it’s hidden
    modalElement.addEventListener("hidden.bs.modal", () => {
      modal.dispose();
      onClose(); // also update your state in parent if needed
    });

    if (isVisible) {
      modal.show();
    } else {
      modal.hide();
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      modalElement.removeEventListener("hidden.bs.modal", () => {
        modal.dispose();
        onClose();
      });
    };
  }, [isVisible, onClose]);

  return (
    <Fragment>
      {/* Modal */}
      <div
        className="modal fade"
        id="exampleModalCenter"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                {language === "en" ? "Log Out" : "خروج از حساب کاربری" }
              </h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
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
                data-bs-dismiss="modal"
                style={{ marginRight: "1rem", marginBottom: "2rem" }}
              >
                {language === "en" ? "Close" : "انصراف" } 
              </button>
              <button 
                onClick={(e) => logoutHandler(e)}
                type="button" 
                className="btn btn-primary" 
                data-bs-dismiss="modal"
                style={{ marginRight: "1rem", marginBottom: "2rem" }}
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
