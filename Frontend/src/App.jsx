import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Register from "./Pages/Register/Register";
import { Toaster } from "react-hot-toast";
import Login from "./Pages/Login/Login";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Profile from "./Pages/Profile/Profile";
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute";
import Explore from "./Pages/Explore/Explore";
import ProjectDetail from "./Pages/ProjectDetail/ProjectDetail";
import CreateProject from "./Pages/CreateProject/CreateProject";
import MyApplications from "./Pages/MyApplications/MyApplications";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import Assessment from "./Pages/Assessment/Assessment";
import ManageProject from "./Pages/ManageProject/ManageProject";


const App = () => {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: { icon: null },
          error: { icon: null },
          loading: { icon: null }
        }} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manage-project/:id" element={<ProtectedRoute><ManageProject /></ProtectedRoute>} />
        {/* Assessment — accessible without protection (handles login internally) */}
        <Route path="/assessment" element={<Assessment />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
