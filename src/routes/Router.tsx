import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import Error from "../pages/Error";
import { Contact } from "../pages/Contact";
import { About } from "../pages/About";
import { Register } from "../pages/auth/Register";
import { Login } from "../pages/auth/Login";
import EmailVerification from "../pages/auth/EmailVerification";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard";
import { UserDashboard } from "../pages/dashboard/UserDashboard";
import { DoctorDashboard } from "../pages/dashboard/DoctorDashboard";
import { AppointmentList } from "../pages/appointments/AppointmentList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/contact",
    element: <Contact />,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <Error />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/email-verification",
    element: <EmailVerification />,
    errorElement: <Error />,
  },

  // Admin Dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "appointments",
        element: <AppointmentList />,
      },
    ],
  },

  // User Dashboard
  {
    path: "/user-dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: "appointments",
        element: <AppointmentList />,
      },
    ],
  },

  // Doctor Dashboard
  {
    path: "/doctor-dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <DoctorDashboard />,
      },
      {
        path: "appointments",
        element: <AppointmentList />,
      },
    ],
  },
]);
