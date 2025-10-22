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
import AdminTimeTrackingPage from './pages/TimeTracking/AdminTimeTrackingPage';
import LeaveManagementPage from './pages/Leave/LeaveManagementPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import UnifiedInsightsPage from './pages/Feedback/UnifiedInsightsPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrgChartPage from './pages/OrgChart/OrgChartPage';
import EmployeeProfilePage from './pages/EmployeeProfile/EmployeeProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import RoleManagementPage from './pages/RoleManagement/RoleManagementPage';
import PermissionsPage from './pages/Permissions/PermissionsPage';
import RolesPage from './pages/Roles/RolesPage';
import ChatPage from './pages/Chat/ChatPage';
import PerformancePage from './pages/Performance/PerformancePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage';

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
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

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
                <Route path="time-tracking/admin" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AdminTimeTrackingPage />
                  </ProtectedRoute>
                } />
                <Route path="leave-management" element={<LeaveManagementPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="feedback/insights" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UnifiedInsightsPage />
                  </ProtectedRoute>
                } />
                <Route path="user-management" element={<UserManagementPage />} />
                <Route path="role-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RoleManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="permissions" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PermissionsPage />
                  </ProtectedRoute>
                } />
                <Route path="roles" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RolesPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="performance" element={<PerformancePage />} />
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
