import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBullhorn,
  FaPeopleCarry,
  FaWarehouse,
  FaUserCog,
  FaPhoneAlt,
  FaSms,
  FaPhoneSquareAlt,
  FaEnvelope,
  FaFacebookF,
} from "react-icons/fa";
import "../css/Dashboard.css";

import jaenlogo from "../../assets/images/jaenlogo.png";
import hero1 from "../../assets/images/hero1.jpg";
import hero2 from "../../assets/images/hero2.jpg";
import hero3 from "../../assets/images/hero3.jpg";

import SplashScreen from "../splashscreen/SplashScreen";
import pasiglogo from "../../assets/images/pasiglogo.png";
import pasiglogodrrmo from "../../assets/images/pasiglogodrrmo.png";
import highlights from "../../assets/images/highlights.jpg";
import news1 from "../../assets/images/news1.png";
import forecast from "../../assets/images/forecast.png";
import nelogo from "../../assets/images/nelogo.png";

function PlaceholderImg({
  width = "100%",
  height = 280,
  radius = 12,
  label = "Image coming soon",
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#E8EFEA",
        color: "#0F4D25",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        letterSpacing: ".3px",
        border: "1px solid #D9E0DF",
      }}
    >
      {label}
    </div>
  );
}

const heroImages = [hero2, hero1, hero3];

function Dashboard() {
  const navigate = useNavigate();
  const [currentHero, setCurrentHero] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const startSplash = (e) => {
    if (e) e.preventDefault();
    setShowSplash(true);

    let localDot = 0;
    const dotInterval = setInterval(() => {
      localDot = localDot < 4 ? localDot + 1 : 0;
      setDotCount(localDot);
    }, 200);

    navigate("/login");

    setTimeout(() => {
      clearInterval(dotInterval);
      setFadeOut(true);
      setTimeout(() => setShowSplash(false), 800);
    }, 4000);
  };

  const call = (num) => window.open(`tel:${num}`);
  const sms = (num) => window.open(`sms:${num}`);
  const email = (addr) => window.open(`mailto:${addr}`);

  const heroBg = heroImages[currentHero] || null;

  const scrollToWeather = () => {
    const el = document.getElementById("weather");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard" id="home">

        {/* HEADER */}
        <header className="dashboard-header">
          <div className="brand-left">
            {jaenlogo ? (
              <img src={jaenlogo} alt="Jaen Logo" className="logo-img" />
            ) : (
              <div className="logo-fallback">LOGO</div>
            )}

            <div className="brand-text">
              <div className="brand-name">JAEN, NUEVA ECIJA</div>
              <div className="brand-sub">MDRRMO</div>
            </div>
          </div>

          <div className="header-right">
            <input
              type="text"
              className="header-search"
              placeholder="Search (Weather, News, Hazard Map...)"
            />

            {/* ✅ FIXED NAV */}
            <nav className="nav-links">
              <a href="#home">Home</a>
              <a href="#account" onClick={startSplash}>
                Account
              </a>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section
          className={`hero ${heroBg ? "hero-has-bg" : ""}`}
          style={heroBg ? { backgroundImage: `url(${heroBg})` } : {}}
        >
          {!heroBg && <PlaceholderImg height={460} />}

          <div className="hero-overlay">
            <h1>Welcome to Jaen DRRMO</h1>
            <p>
              Manage evacuation centers, relief operations, and announcements.
            </p>
            <button className="hero-btn" onClick={scrollToWeather}>
              Learn More
            </button>
          </div>
        </section>

        {/* WEATHER */}
        <section className="weather-section" id="weather">
          <h2>LOCALIZED WEATHER FORECAST</h2>

          {forecast ? (
            <img src={forecast} alt="Weather" />
          ) : (
            <PlaceholderImg />
          )}
        </section>

        {/* SERVICES */}
        <section className="cards-container">
          {[
            { icon: <FaPeopleCarry />, title: "Evacuation" },
            { icon: <FaBullhorn />, title: "Announcements" },
            { icon: <FaWarehouse />, title: "Relief" },
            { icon: <FaUserCog />, title: "Account" },
          ].map((card, i) => (
            <div key={i} className="card" onClick={startSplash}>
              {card.icon}
              <h3>{card.title}</h3>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <FaFacebookF />
          <FaEnvelope />
          <FaPhoneAlt />
          <p>© 2026 All rights reserved</p>
        </footer>

        {showSplash && <SplashScreen dotCount={dotCount} fadeOut={fadeOut} />}
      </div>
    </div>
  );
}

export default Dashboard;