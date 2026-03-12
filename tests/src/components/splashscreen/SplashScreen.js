import React, { useEffect, useState } from "react";
import "./SplashScreen.css";
import Logo from "../../assets/images/Logo.png";

function SplashScreen({ onFinish }) {
  const [dotCount, setDotCount] = useState(0);

  // Animate dots 0 → 3 → repeat
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 300);

    // Automatically finish splash after 4s
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onFinish) onFinish(); // callback to hide splash
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="splash-overlay">
      <img src={Logo} alt="Logo" className="splash-logo" />
      <div className="dots-container">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`dot ${i <= dotCount ? "active" : ""}`}></span>
        ))}
      </div>
      <h2 className="splash-text">Connecting to the main server</h2>
    </div>
  );
}

export default SplashScreen;
