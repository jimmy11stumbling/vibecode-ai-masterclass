
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WebSocketProvider } from '@/components/realtime/WebSocketManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/MainLayout';
import { AuthPage } from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import ChatPage from '@/pages/ChatPage';
import EditorPage from '@/pages/EditorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CodeExecutorPage } from '@/pages/CodeExecutorPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AIBuilderPage } from '@/pages/AIBuilderPage';
import { ProductionTestPage } from '@/pages/ProductionTestPage';
import Settings from '@/pages/Settings';
import NotificationsPage from '@/pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Auth routes */}
              <Route path="/login/*" element={<AuthPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/login/forgot-password" replace />} />
              
              {/* Protected routes with main layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<HomePage />} />
                <Route path="ai-builder" element={<AIBuilderPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="editor" element={<EditorPage />} />
                <Route path="projects" element={<DashboardPage />} />
                <Route path="code-executor" element={<CodeExecutorPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="production-test" element={<ProductionTestPage />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
              </Route>
              
              {/* Catch all route */}
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
