import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { FiActivity } from "react-icons/fi";

const HomeStats = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Hitung total semua program kerja
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
        background: "linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)",
        borderRadius: "20px",
        padding: "3rem",
        color: "white",
        textAlign: "center",
        marginBottom: "4rem",
        boxShadow: "0 10px 15px -3px rgba(49, 130, 206, 0.3)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
        <FiActivity />
      </div>
      <h2
        style={{
          fontSize: "4rem",
          fontWeight: "900",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {count}
      </h2>
      <p
        style={{
          fontSize: "1.2rem",
          opacity: 0.9,
          marginTop: "0.5rem",
          fontWeight: "500",
        }}
      >
        TOTAL PROGRAM KERJA
      </p>
      <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
        Dedikasi kami untuk kemajuan bersama
      </p>
    </div>
  );
};

export default HomeStats;
