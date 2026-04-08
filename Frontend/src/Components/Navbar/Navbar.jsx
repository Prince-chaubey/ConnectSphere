import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import logo from "../../assets/logo.gif";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const username = localStorage.getItem("username") || "user";
  const [profilePic, setProfilePic] = useState(null);
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = API_URL.replace('/api', '');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Sync with localStorage
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.profilePic) {
        setProfilePic(userData.profilePic);
      }
    } catch(e) {}
  }, []);

  const isLoggedIn = !!userRole;

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setIsDropdownOpen(false);
    window.location.href = '/login'; // Force redirect to avoid stale state
  };

  const active = (path) =>
    location.pathname === path
      ? "text-blue-600 font-bold bg-blue-50"
      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium";

  const getNavItems = () => {
    const commonItems = [
      { path: "/", label: "Home" },
      { path: "/explore", label: "Explore" }
    ];

    if (!isLoggedIn) {
      return commonItems;
    }

    switch (userRole) {
      case "user":
      case "seeker": 
        return [
          ...commonItems,
          { path: "/my-applications", label: "My Applications" },
        ];

      case "creator":
        return [
          ...commonItems,
          { path: "/create-project", label: "Post Project" },
          { path: "/admin-dashboard", label: "Dashboard" },
        ];

      case "admin":
        return [
          ...commonItems,
          { path: "/create-project", label: "Post Project" },
          { path: "/admin-dashboard", label: "Admin Panel" },
        ];

      default:
        return commonItems;
    }
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 xl:gap-4 group outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500 p-1">
          <div className="relative overflow-hidden rounded-xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
             <img src={logo} alt="logo" className="h-10 w-10 object-cover transform group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-baseline">
            <span className="bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Connect
            </span>
            <span className="bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
              In
            </span>
          </h1>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {getNavItems().map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`px-4 py-2 rounded-full transition-all duration-200 ${active(item.path)}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-transparent hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                Log in
              </Link>
              <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Sign up free
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {profilePic ? (
                  <img src={profilePic.startsWith("http") ? profilePic : `${BASE_URL}${profilePic}`} alt="Profile" className="w-9 h-9 flex-shrink-0 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white">
                    {username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">{username}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1 flex items-center gap-3">
                     {profilePic ? (
                        <img src={profilePic.startsWith("http") ? profilePic : `${BASE_URL}${profilePic}`} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">{username[0]?.toUpperCase() || 'U'}</div>
                     )}
                    <div>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{username}</p>
                        <p className="text-xs font-semibold text-blue-600 capitalize bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-0.5">{userRole}</p>
                    </div>
                  </div>

                  <div className="px-2 py-1 space-y-1">
                     <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                     </Link>
                     {(userRole === "creator" || userRole === "admin") && (
                        <Link to="/admin-dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                           <LayoutDashboard className="w-4 h-4 text-slate-400" /> {userRole === "admin" ? "Admin Panel" : "Dashboard"}
                        </Link>
                     )}
                     {userRole === "user" && (
                       <Link to="/my-applications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-slate-400" /> My Applications
                       </Link>
                     )}
                     
                     <div className="h-px bg-slate-100 my-2 mx-2"></div>
                     
                     <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                     >
                        <LogOut className="w-4 h-4" /> Sign Out
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative z-50"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
         className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
         onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
         <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300">
               <X className="w-5 h-5" />
            </button>
         </div>

         <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
            {isLoggedIn && (
               <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {profilePic ? (
                     <img src={profilePic.startsWith("http") ? profilePic : `${BASE_URL}${profilePic}`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                     <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">{username[0]?.toUpperCase() || 'U'}</div>
                  )}
                  <div>
                     <p className="text-base font-bold text-slate-900">{username}</p>
                     <p className="text-xs font-semibold text-blue-600 capitalize bg-blue-100 inline-block px-2 py-0.5 rounded-full mt-1">{userRole}</p>
                  </div>
               </div>
            )}

            <div className="space-y-2 mb-8">
               {getNavItems().map((item) => (
                  <Link 
                     key={item.path} 
                     to={item.path} 
                     className={`block px-4 py-3 rounded-xl text-base transition-colors ${
                        location.pathname === item.path 
                           ? "bg-blue-50 text-blue-700 font-bold" 
                           : "text-slate-700 font-semibold hover:bg-slate-50"
                     }`}
                  >
                     {item.label}
                  </Link>
               ))}
               {!isLoggedIn && (
                   <Link to="/opportunities" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Opportunities</Link>
               )}
            </div>

            <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
               {!isLoggedIn ? (
                  <>
                     <Link to="/login" className="flex items-center justify-center w-full px-4 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        Log in
                     </Link>
                     <Link to="/register" className="flex items-center justify-center w-full px-4 py-3 text-white bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                        Sign up free
                     </Link>
                  </>
               ) : (
                  <>
                     <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors">
                        <User className="w-5 h-5 text-slate-400" /> View Profile
                     </Link>
                     <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
                     >
                        <LogOut className="w-5 h-5" /> Sign Out
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
    </nav>
  );
};

export default Navbar;