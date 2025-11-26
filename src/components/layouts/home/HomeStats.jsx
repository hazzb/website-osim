import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { FiActivity } from "react-icons/fi";

const HomeStats = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from("program_kerja")
        .select("*", { count: "exact", head: true });
      setCount(count || 0);
    };
    fetchStats();
  }, []);

  return (
    <div
      style={{
        /* GANTI GRADIENT BIRU JADI ORANYE/MERAH (Sunset) */
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        borderRadius: "24px",
        padding: "3rem",
        color: "white",
        textAlign: "center",
        marginBottom: "4rem",
        /* Ganti shadow jadi warna oranye */
        boxShadow: "0 15px 30px -5px rgba(255, 107, 107, 0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dekorasi Background Circle Transparan */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "-50px",
          width: "150px",
          height: "150px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
        }}
      ></div>

      <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>
        <FiActivity />
      </div>
      <h2
        style={{
          fontSize: "4.5rem",
          fontWeight: "900",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {count}+
      </h2>
      <p
        style={{
          fontSize: "1.25rem",
          marginTop: "0.5rem",
          fontWeight: "700",
          letterSpacing: "0.05em",
        }}
      >
        PROGRAM KERJA SERU
      </p>
      <p style={{ fontSize: "1rem", opacity: 0.8, fontWeight: "500" }}>
        Telah terlaksana dan memeriahkan sekolah kita!
      </p>
    </div>
  );
};

export default HomeStats;
