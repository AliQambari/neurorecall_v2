import React, { useState, useEffect } from "react";
import "../styles/UserDetailsModal.css";

const UserDetailsModal = ({ isOpen, onRequestClose, onExited, title, children }) => {
  const [isVisible, setIsVisible] = useState(false); // internal visibility for animation
  const [isClosing, setIsClosing] = useState(false);

  const ANIM_DURATION = 300;

  useEffect(() => {
    if (isOpen) {
      // open immediately
      setIsVisible(true);
      setIsClosing(false);

      // lock body scroll while modal open
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }

    // isOpen is false, start closing if currently visible
    if (isVisible) {
      setIsClosing(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        // call parent's callback to say we fully closed
        if (typeof onExited === "function") onExited();
        // restore scroll (in case cleanup didn't)
        document.body.style.overflow = "";
      }, ANIM_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, onExited]);

  // close via ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        if (typeof onRequestClose === "function") onRequestClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVisible, onRequestClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}
      onClick={() => typeof onRequestClose === "function" && onRequestClose()}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`modal-container ${isClosing ? "slide-down" : "slide-up"}`}
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside
      >
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button
            className="modal-close"
            aria-label="Close"
            onClick={() => typeof onRequestClose === "function" && onRequestClose()}
          >
            ✖
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
