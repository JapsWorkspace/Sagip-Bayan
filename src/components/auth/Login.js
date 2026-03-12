import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SplashScreen from '../splashscreen/SplashScreen';
import pasiglogowhite from '../../assets/images/pasiglogowhite.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('barangay');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [showSplash, setShowSplash] = useState(true);
  const [eError, setEError] = useState("");
  const [pError, setPError] = useState("");

  // ---------- ADMIN LOCK STATE ----------
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 10 * 60 * 1000;
  const [adminAttempts, setAdminAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  useEffect(() => {
    const lockInfo = JSON.parse(localStorage.getItem('adminLock')) || {};
    if (lockInfo.expiresAt && lockInfo.expiresAt > Date.now()) {
      const remaining = lockInfo.expiresAt - Date.now();
      setIsLocked(true);
      setLockMessage(`Too many failed attempts. Try again in:`);
      setCountdown(Math.ceil(remaining / 1000));
      setAdminAttempts(MAX_ATTEMPTS);

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setIsLocked(false);
            setAdminAttempts(0);
            setLockMessage('');
            localStorage.removeItem('adminLock');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, []);

 const handleLogin = async () => {
  // Trim input to avoid accidental spaces
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return alert('Please fill all fields');
  }

  if (role === 'admin' && isLocked) return;

  const payload = {
    email: trimmedEmail,
    password: trimmedPassword
  };

  console.log("Login attempt body:", payload); // debug check

  try {
    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!res.ok) {
      // Admin lock logic
      if (role === 'admin') {
        const attempts = adminAttempts + 1;
        setAdminAttempts(attempts);

        if (attempts >= MAX_ATTEMPTS) {
          const expiresAt = Date.now() + LOCK_DURATION;
          setIsLocked(true);
          setLockMessage(`Too many failed attempts. Try again in:`);
          setCountdown(Math.ceil(LOCK_DURATION / 1000));
          localStorage.setItem('adminLock', JSON.stringify({ attempts: MAX_ATTEMPTS, expiresAt }));
        } else {
          alert(`Login failed. Attempts left: ${MAX_ATTEMPTS - attempts}`);
        }
      } else {
        alert(data.message || 'Login failed');
      }
      return;
    }

    // Save user info
    setUser(data);
    localStorage.setItem('role', data.role);

    // Redirect based on role
    if (data.role === 'admin') navigate('/admin/dashboard');
    else if (data.role === 'drrmo') navigate('/drrmo/dashboard');
    else navigate('/barangay/dashboard');

  } catch (err) {
    console.error("Login fetch error:", err);
    alert("Login failed. Check server or network.");
  }
};
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="login-bg">
      <div className="login-content">
        <div className="login-card split">

          {/* LEFT SIDE */}
          <div className="login-left">
            <img src={pasiglogowhite} alt="Pasig Logo" className="login-left-logo" />
            <span>
              “Connecting Communities.<br />
              Managing Disasters Efficiently.”
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="login-right">
            <h3>Login</h3>

            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="barangay">Barangay</option>
              <option value="drrmo">DRRMO</option>
              <option value="admin">Admin</option>
            </select>

            <input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {role === 'admin' && !isLocked && (
              <p>Attempts left: {MAX_ATTEMPTS - adminAttempts}</p>
            )}

            {isLocked && (
              <p className="locked-message">
                🔒 {lockMessage} {Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}
              </p>
            )}

            <button onClick={handleLogin} disabled={isLocked}>
              {isLocked ? 'ACCOUNT LOCKED' : 'LOGIN'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
