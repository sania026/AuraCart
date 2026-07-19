import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user || data);
      const userToken = data.token;
      setToken(userToken);
      localStorage.setItem('token', userToken);
      return data;
    } catch (err) {
      let msg = 'Login failed. Please check credentials.';
      if (err.response?.data?.errors) {
        msg = err.response.data.errors.map((e) => e.msg).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      // Return custom structured error to let Login.jsx know if it's an unverified account
      throw { message: msg, response: err.response };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    } catch (err) {
      let msg = 'Registration failed.';
      if (err.response?.data?.errors) {
        msg = err.response.data.errors.map((e) => e.msg).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setUser(data.user || data);
      const userToken = data.token;
      setToken(userToken);
      localStorage.setItem('token', userToken);
      return data;
    } catch (err) {
      let msg = 'OTP verification failed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const resendOtp = async (email) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      return data;
    } catch (err) {
      let msg = 'Failed to resend OTP.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      let msg = 'Request failed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
      return data;
    } catch (err) {
      let msg = 'Password reset failed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      return data;
    } catch (err) {
      let msg = 'Failed to update profile.';
      if (err.response?.data?.errors) {
        msg = err.response.data.errors.map((e) => e.msg).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
