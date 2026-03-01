"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ImageViewer from "@/components/ui/ImageViewer";

const LightboxContext = createContext();

export const useLightbox = () => {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return context;
};

export const LightboxProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    src: "",
    alt: "",
    caption: "",
  });

  const openLightbox = useCallback((src, alt = "", caption = "") => {
    setState({
      isOpen: true,
      src,
      alt,
      caption,
    });
  }, []);

  const closeLightbox = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      <ImageViewer
        isOpen={state.isOpen}
        onClose={closeLightbox}
        src={state.src}
        alt={state.alt}
        caption={state.caption}
      />
    </LightboxContext.Provider>
  );
};
