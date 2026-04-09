import React from "react";
import { Link } from "react-router-dom";
import { Globe2, MessageCircle, Link as LinkIcon, Code2, Heart, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 mt-16 text-slate-300 font-sans border-t border-slate-800 relative py-12 md:py-16 overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand & Description (Takes up 2 columns on lg) */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500">
               <h2 className="text-3xl font-extrabold flex tracking-tight mb-4">
                 <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                   Connect
                 </span><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-1">
                   Sphere
                 </span>
               </h2>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm font-medium mb-6">
              The premier platform to connect with talented builders, collaborate on cutting-edge projects, 
              and explore world-class opportunities.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white transition-all duration-300 text-slate-400 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-slate-700 hover:border-blue-500">
                <Globe2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-300 text-slate-400 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 border border-slate-700 hover:border-sky-500" aria-label="Social">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-blue-700 hover:text-white transition-all duration-300 text-slate-400 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 border border-slate-700 hover:border-blue-700" aria-label="LinkedIn">
                <LinkIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-300 text-slate-400 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-500 border border-slate-700 hover:border-slate-500" aria-label="GitHub">
                <Code2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold mb-5 tracking-wide">Platform</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link to="/explore" className="text-slate-400 hover:text-blue-400 transition-colors">Explore Projects</Link></li>
              <li><Link to="/talent" className="text-slate-400 hover:text-blue-400 transition-colors">Find Talent</Link></li>
              <li><Link to="/find-work" className="text-slate-400 hover:text-blue-400 transition-colors">Find Work</Link></li>
              <li><Link to="/opportunities" className="text-slate-400 hover:text-blue-400 transition-colors">Opportunities</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold mb-5 tracking-wide">Resources</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Company Blog</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Community Guides</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold mb-5 tracking-wide">Company</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
            
            <a href="mailto:hello@connectsphere.com" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group">
              <Mail className="w-4 h-4" /> 
              <span>hello@connectsphere.com</span>
            </a>
          </div>

        </div>

        {/* Bottom Divider / Copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
          <p className="text-slate-500">
            © {new Date().getFullYear()} ConnectSphere Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
            Crafted with <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" /> for builders
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;