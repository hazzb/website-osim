// src/components/ui/HoverCard.jsx
import React from "react";

const HoverCard = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default HoverCard;
