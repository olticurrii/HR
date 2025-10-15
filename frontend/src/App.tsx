import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TasksPage from './pages/Tasks/TasksPage';
import CreateTaskPage from './pages/Tasks/CreateTaskPage';
import TaskDetailPage from './pages/Tasks/TaskDetailPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import ProjectDetailPage from './pages/Projects/ProjectDetailPage';
import TimeTrackingPage from './pages/TimeTracking/TimeTrackingPage';
import LeaveManagementPage from './pages/LeaveManagement/LeaveManagementPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import AIInsightsPage from './pages/AIInsights/AIInsightsPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrgChartPage from './pages/OrgChart/OrgChartPage';
import EmployeeProfilePage from './pages/EmployeeProfile/EmployeeProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import RoleManagementPage from './pages/RoleManagement/RoleManagementPage';
import ChatPage from './pages/Chat/ChatPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/create" element={<CreateTaskPage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="time-tracking" element={<TimeTrackingPage />} />
                <Route path="leave-management" element={<LeaveManagementPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="ai-insights" element={<AIInsightsPage />} />
                <Route path="user-management" element={<UserManagementPage />} />
                <Route path="role-management" element={
                  <ProtectedRoute requiredPermission={{ resource: 'users', action: 'create' }}>
                    <RoleManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredPermission={{ resource: 'settings', action: 'view' }}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="people/org-chart" element={<OrgChartPage />} />
                <Route path="people/:userId" element={<EmployeeProfilePage />} />
                <Route path="chat" element={<ChatPage />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
