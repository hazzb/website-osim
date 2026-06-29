import React from "react";

const PageContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`max-w-6xl mx-auto px-6 w-full min-h-[80vh] box-border ${className}`}
    >
      <div className={`pb-12 pt-0`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
