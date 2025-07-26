import {
  Car,
  Home,
  MapPin,
  Package,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { BsPrescription } from "react-icons/bs";
import { FaMoneyBill } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || "user";

  const baseLinks = {
    dashboard: {
      name: "Dashboard",
      path: role === "doctor" ? "/doctor-dashboard" : "/user-dashboard",
      icon: Home,
      color: "from-[#093FB4] to-[#093FB4]",
    },
    appointment: {
      name: "Appointments",
      path:
        role === "doctor"
          ? "/doctor-dashboard/appointments"
          : "/user-dashboard/appointments",
      icon: Calendar,
      color: "from-[#093FB4] to-[#093FB4]",
    },
    prescription: {
      name: "Prescriptions",
      path:
        role === "doctor"
          ? "/doctor-dashboard/prescriptions"
          : "/user-dashboard/prescriptions",
      icon: BsPrescription,
      color: "from-red-500 to-red-600",
    },
    payment: {
      name: "Payments",
      path:
        role === "doctor"
          ? "/doctor-dashboard/payments"
          : "/user-dashboard/payments",
      icon: FaMoneyBill,
      color: "from-orange-500 to-orange-700",
    },
    complaint: {
      name: "Complaints",
      path: "/user-dashboard/complaints",
      icon: Package,
      color: "from-teal-500 to-teal-600",
    },
    browseDoctors: {
      name: "Browse Doctors",
      path: "/browse-doctors",
      icon: Search,
      color: "from-purple-500 to-purple-600",
    },
    medicalHistory: {
      name: "Medical History",
      path: "/user-dashboard/medical-history",
      icon: MessageSquare,
      color: "from-indigo-500 to-indigo-600",
    },
  };

  const adminMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home, color: "from-[#093FB4] to-[#093FB4]" },
    { name: "Doctors", path: "/dashboard/doctors", icon: BookOpen, color: "from-teal-500 to-teal-600" },
    { name: "Complaints", path: "/dashboard/complaints", icon: Package, color: "from-orange-500 to-orange-600" },
    { name: "Users", path: "/dashboard/users", icon: Users, color: "from-purple-500 to-purple-600" },
    { name: "Payments", path: "/dashboard/payments", icon: Car, color: "from-cyan-500 to-cyan-600" },
    { name: "Appointments", path: "/dashboard/appointments", icon: MapPin, color: "from-pink-500 to-pink-600" },
    { name: "Prescriptions", path: "/dashboard/prescriptions", icon: BsPrescription, color: "from-red-500 to-red-600" },
    { name: "Specialization", path: "/dashboard/specializations", icon: MessageSquare, color: "from-indigo-500 to-indigo-600" },
    { name: "Doctor Availability", path: "/dashboard/doctor-availability", icon: Calendar, color: "from-indigo-500 to-indigo-600" },
  ];

  const userMenuItems = [
    baseLinks.dashboard,
    baseLinks.appointment,
    baseLinks.prescription,
    baseLinks.payment,
    baseLinks.complaint,
    baseLinks.browseDoctors,
    baseLinks.medicalHistory
  ];

  const doctorMenuItems = [
    baseLinks.dashboard,
    baseLinks.appointment,
    baseLinks.prescription,
  ];

  const menuItems =
    role === "admin"
      ? adminMenuItems
      : role === "doctor"
      ? doctorMenuItems
      : userMenuItems;

  const roleTitle = role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "User";
  const roleSubtitle =
    role === "admin"
      ? "Management Portal"
      : role === "doctor"
      ? "Doctor Panel"
      : "User Dashboard";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-opacity-30 z-30 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-white w-72 h-screen shadow-xl fixed top-0 left-0 z-40 border-r border-slate-200 overflow-y-auto transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-blue-800">Meditime</h1>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
              {roleTitle} <span className="mx-1">•</span> {roleSubtitle}
            </p>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-blue-500 hover:text-blue-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex flex-col mt-8 px-4 space-y-2 pb-6">
          {menuItems.map(({ name, path, icon: Icon, color }) => {
            const isActive =
              pathname === path || pathname.startsWith(path + "/");

            return (
              <NavLink
                key={name}
                to={path}
                className={`group flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-[#093FB4] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)} // Close on mobile nav click
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${color} shadow-md`
                      : "bg-slate-100 group-hover:bg-slate-200"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-600"
                    }`}
                  />
                </div>
                <span className="font-medium">{name}</span>
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-[#093FB4] rounded-full" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
