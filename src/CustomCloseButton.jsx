import React from "react";

const CustomCloseButton = ({ closeToast }) => (
    <button
      onClick={closeToast}
      style={{
        background: "none",
        border: "none",
        fontSize: "12px", // Slightly smaller for better alignment
        color: "#333", // Button color
        cursor: "pointer",
        position: "absolute",
        top: "4px", // Adjusted slightly for better alignment
        right: "0px", // Adjusted slightly for better alignment
        padding: "0", // No padding to avoid unnecessary space
        lineHeight: "1",
      }}
    >
      ✖
    </button>
  );
  
  export default CustomCloseButton;
  