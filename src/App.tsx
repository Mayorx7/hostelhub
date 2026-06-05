import { Navigate, Route, Routes } from "react-router-dom";

// Public pages
import Overview from "./pages/Overview";
import HowToApply from "./pages/HowToApply";
import Fees from "./pages/Fees";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";

// Auth guard
import ProtectedRoute from "./components/ProtectedRoute";

// Admin dashboard layout + pages
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AdminRooms from "./pages/AdminRooms";
import Guests from "./pages/Guests";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import AdminAnnouncements from "./pages/AdminAnnouncements";

// Student dashboard layout + pages
import StudentLayout from "./components/StudentLayout";
import StudentDashboardHome from "./pages/StudentDashboardHome";
import Apply from "./pages/Apply";
import ExploreBlocks from "./pages/ExploreBlocks";
import ExploreRooms from "./pages/ExploreRooms";
import StudentMyRoom from "./pages/StudentMyRoom";
import StudentPayments from "./pages/StudentPayments";
import StudentMaintenance from "./pages/StudentMaintenance";

function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<Overview />} />
      <Route path="/how-to-apply" element={<HowToApply />} />
      <Route path="/fees" element={<Fees />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Admin dashboard routes ── */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/rooms"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <AdminRooms />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/guests"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Guests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/bookings"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Bookings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/payments"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Payments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/maintenance"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Maintenance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/reports"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard/announcements"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <AdminAnnouncements />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ── Student dashboard routes ── */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <StudentDashboardHome />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      {/* Explore flow: Block → Room → Apply */}
      <Route
        path="/student-dashboard/explore"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <ExploreBlocks />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/explore/:blockId"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <ExploreRooms />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/apply"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <Apply />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/apply/:roomId"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <Apply />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/my-room"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <StudentMyRoom />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/payments"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <StudentPayments />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard/maintenance"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <StudentMaintenance />
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy redirect — keep old /apply and /dashboard working */}
      <Route
        path="/apply"
        element={<Navigate to="/student-dashboard/apply" replace />}
      />
      <Route
        path="/dashboard"
        element={<Navigate to="/admin-dashboard" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
