
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import LandingPage from '@/components/LandingPage';
import UserAuth from '@/components/auth/UserAuth';
import HRAuth from '@/components/auth/HRAuth';
import UserDashboard from '@/components/dashboard/UserDashboard';
import HRDashboard from '@/components/dashboard/HRDashboard';
import { AuthProvider } from '@/contexts/AuthContext';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/user" element={<UserAuth />} />
          <Route path="/auth/hr" element={<HRAuth />} />
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/hr" element={<HRDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
};

export default Index;
