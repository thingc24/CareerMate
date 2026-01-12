import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import JobList from './pages/student/JobList';
import JobDetail from './pages/student/JobDetail';
import JobRecommendations from './pages/student/JobRecommendations';
import CVUpload from './pages/student/CVUpload';
import CVAnalysis from './pages/student/CVAnalysis';
import CareerRoadmap from './pages/student/CareerRoadmap';
import Quiz from './pages/student/Quiz';
import Applications from './pages/student/Applications';
import Profile from './pages/student/Profile';
import ProfileView from './pages/student/ProfileView';
import Articles from './pages/student/Articles';
import ArticleDetail from './pages/student/ArticleDetail';
import Companies from './pages/student/Companies';
import CompanyDetail from './pages/student/CompanyDetail';
import CVTemplates from './pages/student/CVTemplates';
import CVTemplateEditor from './pages/student/CVTemplateEditor';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import CoursePlayer from './pages/student/CoursePlayer';
import Challenges from './pages/student/Challenges';
import ChallengeDetail from './pages/student/ChallengeDetail';
import Packages from './pages/student/Packages';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import Applicants from './pages/recruiter/Applicants';
import FindCandidates from './pages/recruiter/FindCandidates';
import RecruiterCompany from './pages/recruiter/Company';
import CompanyView from './pages/recruiter/CompanyView';
import CompanyEdit from './pages/recruiter/CompanyEdit';
import RecruiterProfile from './pages/recruiter/Profile';
import RecruiterCreateArticle from './pages/recruiter/CreateArticle';
import MyArticles from './pages/recruiter/MyArticles';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';
import AdminCreateArticle from './pages/admin/CreateArticle';
import ArticleManagement from './pages/admin/ArticleManagement';
import CVTemplatesManagement from './pages/admin/CVTemplatesManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import Analytics from './pages/admin/Analytics';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      
      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="jobs" element={<JobList />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="recommendations" element={<JobRecommendations />} />
                <Route path="cv" element={<CVUpload />} />
                <Route path="cv/:cvId/analysis" element={<CVAnalysis />} />
                <Route path="roadmap" element={<CareerRoadmap />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="applications" element={<Applications />} />
                <Route path="articles" element={<Articles />} />
                <Route path="articles/:id" element={<ArticleDetail />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:id" element={<CompanyDetail />} />
                <Route path="cv-templates" element={<CVTemplates />} />
                <Route path="cv-templates/:id" element={<CVTemplateEditor />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="courses/:courseId/learn/:enrollmentId/:lessonId" element={<CoursePlayer />} />
                <Route path="challenges" element={<Challenges />} />
                <Route path="challenges/:id" element={<ChallengeDetail />} />
                <Route path="packages" element={<Packages />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="profile/view" element={<ProfileView />} />
                <Route path="profile/edit" element={<Profile />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Recruiter Routes */}
      <Route
        path="/recruiter/*"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterLayout>
              <Routes>
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="applicants" element={<Applicants />} />
                <Route path="find-candidates" element={<FindCandidates />} />
                <Route path="company" element={<Navigate to="company/view" replace />} />
                <Route path="company/view" element={<CompanyView />} />
                <Route path="company/edit" element={<CompanyEdit />} />
                <Route path="profile" element={<RecruiterProfile />} />
                <Route path="articles/create" element={<RecruiterCreateArticle />} />
                <Route path="articles" element={<MyArticles />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RecruiterLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="jobs" element={<JobManagement />} />
                <Route path="articles" element={<ArticleManagement />} />
                <Route path="articles/create" element={<AdminCreateArticle />} />
                <Route path="cv-templates" element={<CVTemplatesManagement />} />
                <Route path="packages" element={<PackagesManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Default Route */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'STUDENT' ? (
              <Navigate to="/student/dashboard" replace />
            ) : user.role === 'RECRUITER' ? (
              <Navigate to="/recruiter/dashboard" replace />
            ) : user.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

