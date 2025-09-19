import { useRef } from "react";
import { FaCamera } from "react-icons/fa";

const ProfileImageUpload = ({ onChange, source }) => {
  const inputRef = useRef();

  const handleClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="position-relative mb-5" style={{
      display: "flex", alignItems: "center", justifyContent: "center"}}>
      <img
        src={source}
        alt="Profile"
        className="rounded-circle"
        style={{ 
            width: "80px", 
            height: "80px", 
            objectFit: "cover", 
            border: "3px solid #5971d1",
        }}
      />
      <button
        type="button"
        onClick={handleClick}
        className="btn btn-sm upload-btn"
        style={{
          width: "30px", 
          height: "30px", 
          position: "absolute",
          bottom: "-10%",
          right: "10%",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          transition: "all 0.25s",

          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <FaCamera color="white" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
    </div>
  );
};

export default ProfileImageUpload;