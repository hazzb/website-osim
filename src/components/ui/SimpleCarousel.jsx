// src/components/ui/SimpleCarousel.jsx
import React from "react";

const SimpleCarousel = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="carousel-wrapper">
      <div className="carousel-track">
        {items.map((item, index) => {
          // Logic: Support format lama (string) & baru (object)
          const src = typeof item === "string" ? item : item.url;
          const caption = typeof item === "object" ? item.caption : "";

          return (
            <div key={index} className="carousel-slide">
              <img src={src} alt={`Slide ${index + 1}`} />

              {/* TAMPILKAN CAPTION JIKA ADA */}
              {caption && (
                <div className="carousel-caption">
                  <p>{caption}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="carousel-indicators">{items.length} Slide</div>
      )}

      <style jsx>{`
        .carousel-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .carousel-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }
        .carousel-track::-webkit-scrollbar {
          display: none;
        }

        .carousel-slide {
          flex: 0 0 100%;
          scroll-snap-align: center;
          position: relative; /* Penting untuk posisi caption */
        }

        .carousel-slide img {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
        }

        /* STYLE CAPTION BARU */
        .carousel-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem 1.5rem 1.5rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
        }

        .carousel-caption p {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .carousel-indicators {
          position: absolute;
          top: 1rem; /* Pindah ke atas agar tidak bentrok dengan caption */
          right: 1rem;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default SimpleCarousel;
