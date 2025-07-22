
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WebSocketProvider } from '@/components/realtime/WebSocketManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SovereignIDE } from '@/components/SovereignIDE';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CodeExecutorPage } from '@/pages/CodeExecutorPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <SovereignIDE />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/code-executor" element={
                <ProtectedRoute>
                  <CodeExecutorPage />
                </ProtectedRoute>
              } />
              
              <Route path="/templates" element={
                <ProtectedRoute>
                  <TemplatesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
