import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { PageSkeleton } from './components/Skeletons';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const AuthSelection = lazy(() => import('./pages/AuthSelection'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const DoctorsList = lazy(() => import('./pages/DoctorsList'));
const PatientsList = lazy(() => import('./pages/PatientsList'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="bg-slate-50 font-sans min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <Toaster position="top-right" />
      <main className={`w-full flex-grow ${isHome ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-12'}`}>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Auth Selection */}
            <Route path="/login" element={<AuthSelection />} />
            <Route path="/register" element={<AuthSelection />} />
            
            {/* Split Auth Routes */}
            <Route path="/patient/login" element={<Login />} />
            <Route path="/doctor/login" element={<Login />} />
            <Route path="/patient/register" element={<Register />} />
            <Route path="/doctor/register" element={<Register />} />
            
            <Route path="/patient/dashboard/:tab?" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DoctorsList />
              </ProtectedRoute>
            } />

            <Route path="/doctor/dashboard/:tab?" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PatientsList />
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
