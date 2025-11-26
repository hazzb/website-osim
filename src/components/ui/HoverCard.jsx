// src/components/ui/HoverCard.jsx
import React from "react";
// PERHATIKAN: harus .module.css (huruf kecil), bukan .Module.css
import styles from "./HoverCard.module.css";

const HoverCard = ({ children, className = "", onClick }) => {
  return (
    <div className={`${styles.cardContainer} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default HoverCard;
