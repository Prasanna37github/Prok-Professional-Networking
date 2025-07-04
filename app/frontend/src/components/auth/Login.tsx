import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from './api';

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ emailOrUsername?: string; password?: string }>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let errors: { emailOrUsername?: string; password?: string } = {};
    if (!emailOrUsername) errors.emailOrUsername = 'Username or Email is required.';
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email: emailOrUsername, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        setSuccess('Login successful!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center text-black">Login</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-black font-medium">Username or Email</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring text-black"
              placeholder="Username or Email"
              value={emailOrUsername}
              onChange={e => { setEmailOrUsername(e.target.value); setFieldErrors(f => ({ ...f, emailOrUsername: undefined })); }}
              required
            />
            {fieldErrors.emailOrUsername && (
              <div className="text-red-500 text-sm">{fieldErrors.emailOrUsername}</div>
            )}
            <label className="block text-black font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring text-black"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
              required
            />
            {fieldErrors.password && (
              <div className="text-red-500 text-sm">{fieldErrors.password}</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-black rounded hover:bg-green-700 focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-center text-sm mt-4 text-black">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
