import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.gif";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast"

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL=import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); 
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await axios.post(`${API_URL}/auth/login`, formData);
  
    //console.log(res.data.token);
   
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    localStorage.setItem("username",res.data.user.name);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    toast.success(res.data.message || "Login successful");

    setFormData({
      email: "",
      password: "",
    });

    //redirect after login
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect") || "/";
    navigate(redirectUrl);

  } catch (err) {
    toast.error(
      err.response?.data?.message || "Login failed"
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Layout>
        <div className="min-h-screen flex">
      
      {/* LEFT SIDE - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white flex-col justify-center px-12 relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-purple-500/20 rounded-full animate-float-delay"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-md mx-auto animate-slide-up">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12 animate-fade-in">
            <img 
              src={logo} 
              alt="logo" 
              className="h-12 w-12 rounded-xl bg-white p-1 animate-bounce-slow" 
            />
            <h1 className="text-2xl font-bold text-white">
              Connect<span className="text-purple-300">In</span>
            </h1>
          </div>
          
          {/* Welcome Message */}
          <h2 className="text-4xl font-bold mb-4 animate-slide-right">
            Welcome back! 👋
          </h2>
          
          <p className="text-lg text-blue-100 mb-8 animate-slide-right" style={{ animationDelay: "0.1s" }}>
            Sign in to continue your journey<br />
            of innovation and collaboration
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 animate-slide-left" style={{ animationDelay: "0.2s" }}>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Access your applications</span>
            </div>
            
            <div className="flex items-center gap-3 animate-slide-left" style={{ animationDelay: "0.3s" }}>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Track your projects</span>
            </div>
            
            <div className="flex items-center gap-3 animate-slide-left" style={{ animationDelay: "0.4s" }}>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Connect with team members</span>
            </div>
          </div>
          

        </div>
      </div>
      
      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105 animate-slide-in-right">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <img src={logo} alt="logo" className="h-12 w-12 rounded-xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in-up">
              ❌ {error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <div className="relative group">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative group">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
            
            {/* Register Link */}
            <p className="text-center text-gray-600 mt-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline transition-all hover:ml-1">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-right {
          animation: slide-right 0.6s ease-out;
        }
        
        .animate-slide-left {
          animation: slide-left 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in-right {
          animation: slide-left 0.6s ease-out;
        }
      `}</style>
    </div>
    </Layout>
  );
};

export default Login;