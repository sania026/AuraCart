import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [counter, setCounter] = useState(60);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  // Focus the first OTP box on load if email is present
  useEffect(() => {
    if (email) {
      const firstInput = document.getElementById('otp-input-0');
      if (firstInput) firstInput.focus();
    }
  }, [email]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [counter]);

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    // Allow only digits
    if (/^[0-9]$/.test(val) || val === '') {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);

      // Move focus forward
      if (val !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] !== '') {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      const lastInput = document.getElementById('otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setLocalError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLocalError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await verifyOtp(email, otpCode);
      setSuccessMsg('Email verified successfully!');
      setTimeout(() => {
        navigate('/login?verified=true');
      }, 1500);
    } catch (err) {
      setLocalError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setLocalError('Please enter your email address before resending OTP.');
      return;
    }

    setLocalError('');
    setSuccessMsg('');
    setResending(true);

    try {
      await resendOtp(email);
      setSuccessMsg('Verification OTP code resent successfully!');
      setCounter(60);
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-input-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '440px', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Verify Email
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            We've sent a 6-digit code to verify your account
          </p>
        </div>

        {localError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} /> {localError}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Email input field (editable if not passed from registration) */}
          <div>
            <label className="input-label" htmlFor="email-input">Email Address</label>
            <input
              type="email"
              id="email-input"
              className="input-field"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!initialEmail}
              required
            />
          </div>

          <div>
            <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block', textAlign: 'center' }}>
              Enter 6-Digit Code
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  id={`otp-input-${index}`}
                  className="input-field"
                  style={{ width: '45px', height: '48px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', padding: 0 }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  autoComplete="off"
                  disabled={submitting}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || otp.join('').length < 6}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          {counter > 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Resend OTP in <strong style={{ color: 'var(--primary)' }}>{counter}s</strong>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
