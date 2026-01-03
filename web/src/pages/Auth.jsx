import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      // Login Logic
      toast.success('Login successfully!');
      localStorage.setItem('user', JSON.stringify({ name: formData.email.split('@')[0], email: formData.email }));
      navigate('/');
    } else {
      // Signup Logic
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      toast.success('Account created successfully!');
      setIsLogin(true); // Switch to login view after signup
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500 mt-2">Enter your institutional details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={handleInputChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleInputChange}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={handleInputChange}
              />
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;