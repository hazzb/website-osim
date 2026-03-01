import React from "react";
import Breadcrumbs from "../Breadcrumbs.jsx";

const PageContainer = ({ children, breadcrumbText, className = "" }) => {
  return (
    <div
      className={`max-w-6xl mx-auto px-6 w-full min-h-[80vh] box-border ${className}`}
    >
      <div className={`pb-12 ${breadcrumbText ? "pt-0" : "pt-4"}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
