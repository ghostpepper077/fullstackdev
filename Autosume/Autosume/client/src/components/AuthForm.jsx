import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ isLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const { data } = await axios.post(`/api/auth/${endpoint}`, { 
        email, 
        password 
      });
      
      // Store user data (you'll replace this with proper auth context later)
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard'); // Redirect after successful auth
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
        />
        <button type="submit">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;