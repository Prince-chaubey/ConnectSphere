import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Code2, Users, Rocket, Target } from 'lucide-react';

const Hero = () => {
  return (
    <div className="w-full min-h-[90vh] flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans pt-16 lg:pt-0">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
        
        {/* LEFT CONTENT */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-blue-100 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-900 tracking-wide uppercase">The Future of Collaboration</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] mb-6 tracking-tight">
            Build Teams. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Join Projects.
            </span><br className="hidden sm:block" />
            Grow Fast.
          </h1>
          
          <p className="text-slate-600 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed font-medium">
            Connect with verified professionals, assemble powerful teams, and bring ideas to life using intelligent matching & smart workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/explore"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
               Explore Projects
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-slate-500 w-full sm:w-auto">
             <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                   <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                ))}
             </div>
             <p>Joined by <span className="font-bold text-slate-800">5,000+</span> creators globally</p>
          </div>
        </div>

        {/* RIGHT CONTENT - GLASS UI MOCKUP */}
        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none pt-10 lg:pt-0">
          
          {/* Main Dashboard Panel */}
          <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-2xl shadow-blue-900/10 z-20 overflow-hidden transform transition-transform hover:-translate-y-2 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20 blur-2xl"></div>
            
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                     <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">Project Apollo</h3>
                    <p className="text-xs text-slate-500 font-medium">Looking for Frontend Devs</p>
                  </div>
               </div>
               <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Active</span>
            </div>

            {/* Mock Content */}
            <div className="space-y-4 relative z-10">
               <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-100 flex items-center justify-between group hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Code2 className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">React Core Build</p>
                        <p className="text-xs text-slate-500">Need 2 Contributors</p>
                     </div>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-full shadow-sm hover:bg-slate-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors">Apply</button>
               </div>
               
               <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-100 flex items-center justify-between group hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Target className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">UI Redesign</p>
                        <p className="text-xs text-slate-500">Filled • Figma</p>
                     </div>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm cursor-not-allowed">Full</button>
               </div>
            </div>
          </div>
          
          {/* Floating Element 1 */}
          <div className="absolute -top-6 -right-6 lg:-right-10 w-48 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 z-30 animate-[bounce_5s_infinite] hidden sm:block">
            <div className="flex items-center gap-3 mb-2">
               <img src="https://i.pravatar.cc/100?img=4" alt="Reviewer" className="w-8 h-8 rounded-full shadow-sm" />
               <div>
                  <p className="text-xs font-bold text-slate-800">Sarah M.</p>
                  <p className="text-[10px] text-slate-400 font-medium">Sent an invite</p>
               </div>
            </div>
            <div className="flex gap-2 mt-3">
               <button className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">Accept</button>
            </div>
          </div>

          {/* Floating Element 2 */}
          <div className="absolute -bottom-10 -left-6 lg:-left-12 w-56 bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700 z-30 transform -rotate-3 animate-[bounce_6s_infinite_reverse] hidden sm:block">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm"><Users className="w-4 h-4"/></div>
                  <p className="text-white text-sm font-bold">Team Joined!</p>
               </div>
               <span className="text-emerald-400 text-xs font-bold">+50 EXP</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;