import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../css/Register.css'; // keep your design

export default function Register() {
  const navigate = useNavigate();

  // ---------- AUTH GUARD ----------
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login if no role
    }
  }, [navigate]);

  // ---------- FORM STATE ----------
  const [role, setRole] = useState('barangay');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [barangay, setBarangay] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hotline, setHotline] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  const barangays = Array.from({ length: 25 }, (_, i) => `Brgy ${i + 1}`);

  // ---------- VALIDATORS (same functionality you shared) ----------
  function validatePassword(pw) {
    if (!pw) return 'Password is required';
    if (!/^[A-Z]/.test(pw)) return 'Password must start with a capital letter';
    if (!/\d/.test(pw)) return 'Password must contain at least one number';
    if (pw.length < 8) return 'Password must be at least 8 characters';
    return '';
  }
  function validateEmail(value) {
    if (!value) return 'Email is required';
    if (!value.includes('@') || !value.includes('.com')) {
      return 'Email must contain @ and .com';
    }
    return '';
  }
  function validatePhone(value) {
    if (!value) return 'Phone number is required';
    if (!/^\d{10,11}$/.test(value)) return 'Enter valid phone number (10-11 digits)';
    return '';
  }

  // ---------- REAL-TIME VALIDATION ----------
  useEffect(() => {
    const nextErrors = {};

    if (!username) nextErrors.username = 'Username is required';

    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;

    if (!phoneNumber) nextErrors.phoneNumber = 'Phone number is required';
    else {
      const phoneErr = validatePhone(phoneNumber);
      if (phoneErr) nextErrors.phoneNumber = phoneErr;
    }

    if (!address) nextErrors.address = 'Address is required';

    const pwError = validatePassword(password);
    if (pwError) nextErrors.password = pwError;

    if (password !== confirmPassword)
      nextErrors.confirmPassword = 'Passwords do not match';

    if (role === 'barangay' && !barangay)
      nextErrors.barangay = 'Please select a barangay';

    setErrors(nextErrors);
  }, [username, email, barangay, password, confirmPassword, phoneNumber, address, role]);

  // Helper to compute fresh errors at submit time
  function computeErrors() {
    const nextErrors = {};
    if (!username) nextErrors.username = 'Username is required';
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const phoneError = validatePhone(phoneNumber);
    if (phoneError) nextErrors.phoneNumber = phoneError;
    if (!address) nextErrors.address = 'Address is required';
    const pwError = validatePassword(password);
    if (pwError) nextErrors.password = pwError;
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (role === 'barangay' && !barangay) nextErrors.barangay = 'Please select a barangay';
    return nextErrors;
  }

  // ---------- SUBMIT ----------
  function handleRegister() {
    const freshErrors = computeErrors();
    setErrors(freshErrors);
    if (Object.keys(freshErrors).length > 0) {
      alert('Please fix the errors first');
      return;
    }

    const payload = {
      username,
      password,
      role,
      email,
      barangay: role === 'barangay' ? barangay : undefined,
      phoneNumber,
      hotline: hotline || undefined,
      address
    };

    fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
      })
      .then(() => {
        alert(`${role.toUpperCase()} account created`);
        navigate('/admin/dashboard');
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
  }

  // ---------- UI (unchanged design) ----------
  return (
    <div className="register-page">
      {/* Blue top header you already have */}
      <Header />

      {/* App shell: left sidebar + right panel */}
      <div className="shell">
        {/* LEFT SIDEBAR (static UI; no functionality change) */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-text">
              <div className="org">Create an account</div>
              <div className="sub">Add Administrator</div>
            </div>
          </div>

          <nav className="nav">
            <button type="button" className="nav-item active">Create an account</button>
            <button type="button" className="nav-item">Add Administrator</button>
          </nav>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="content">
          <section className="panel">
            <header className="panel-header">
              <h2>Create Admin account</h2>
              <p className="panel-desc">
                Use this form to create an administrator account. Each admin is assigned a role and
                specific permissions that define what parts of the system they can access. For
                security and accountability, admin accounts are created only by Super Admins and
                should be granted the minimum access necessary.
              </p>
            </header>

            {/* Centered column form like the screenshot */}
            <div className="form-body">
              <form
                className="form-grid"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
              >
                {/* Role selection */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Account Role</div>
                    <div className="section-sub">Select the role for this user.</div>
                  </div>
                  <div className="section-control">
                    <div className="radio-row radio-row-inline radio-row-spaced">
                      {['admin', 'drrmo', 'barangay'].map((r) => (
                        <label className="radio" key={r}>
                          <input
                            type="radio"
                            checked={role === r}
                            onChange={() => setRole(r)}
                          />
                          {r.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="divider" />

                {/* Username */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Username</div>
                    <div className="section-sub">Unique handle for sign-in.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        className={`input ${errors.username ? 'invalid' : ''}`}
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                      {errors.username && <span className="error">{errors.username}</span>}
                    </div>
                  </div>
                </div>

                {/* Barangay (role = barangay only) */}
                {role === 'barangay' && (
                  <div className="section">
                    <div className="section-head">
                      <div className="section-title">Barangay</div>
                      <div className="section-sub">Select your barangay.</div>
                    </div>
                    <div className="section-control">
                      <div className="field">
                        <select
                          className={`input ${errors.barangay ? 'invalid' : ''}`}
                          value={barangay}
                          onChange={e => setBarangay(e.target.value)}
                        >
                          <option value="">Select Barangay</option>
                          {barangays.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        {errors.barangay && <span className="error">{errors.barangay}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Email Address</div>
                    <div className="section-sub">We’ll send account info here.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        className={`input ${errors.email ? 'invalid' : ''}`}
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                      {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Phone Number</div>
                    <div className="section-sub">10–11 digits.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        className={`input ${errors.phoneNumber ? 'invalid' : ''}`}
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                      {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                    </div>
                  </div>
                </div>

                {/* Hotline (optional) */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Hotline (optional)</div>
                    <div className="section-sub">Local hotline if available.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        className="input"
                        placeholder="Hotline (optional)"
                        value={hotline}
                        onChange={e => setHotline(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Address</div>
                    <div className="section-sub">Complete address.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        className={`input ${errors.address ? 'invalid' : ''}`}
                        placeholder="Address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                      />
                      {errors.address && <span className="error">{errors.address}</span>}
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Password</div>
                    <div className="section-sub">Start with a capital letter & include a number.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        type="password"
                        className={`input ${errors.password ? 'invalid' : ''}`}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      {errors.password && <span className="error">{errors.password}</span>}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="section">
                  <div className="section-head">
                    <div className="section-title">Confirm Password</div>
                    <div className="section-sub">Must match the password.</div>
                  </div>
                  <div className="section-control">
                    <div className="field">
                      <input
                        type="password"
                        className={`input ${errors.confirmPassword ? 'invalid' : ''}`}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      {errors.confirmPassword && (
                        <span className="error">{errors.confirmPassword}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="section">
                  <div className="section-head" />
                  <div className="section-control actions-right">
                    <button type="submit" className="btn btn-commit">Create Account</button>
                  </div>
                </div>

                {/* Back link */}
                <div className="section">
                  <div className="section-head" />
                  <div className="section-control actions-right">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate('/admin/dashboard')}
                      style={{ width: 220 }}
                    >
                      Go Back to Dashboard
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}