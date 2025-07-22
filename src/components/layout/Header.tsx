import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, LogOut, User, Search, Menu as MenuIcon } from "lucide-react";
import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../app/store";
import { clearCredentials } from "../../feature/auth/authSlice";
import { userApi } from "../../feature/api/userApi";

interface HeaderProps {
  currentSection: string;
  setSidebarOpen?: (open: boolean) => void; // Added prop
}

export const Header = ({ currentSection, setSidebarOpen }: HeaderProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = userApi.useGetUserByUserIdQuery({ userId: user.userId });

  const handleLogout = () => {
    dispatch(clearCredentials(user));
    navigate("/login");
  };

  const handleProfile = () => {
    if (!user?.role) return;
    switch (user.role) {
      case "admin":
        navigate("/dashboard/profile");
        break;
      case "doctor":
        navigate("/doctor-dashboard/profile");
        break;
      case "user":
        navigate("/user-dashboard/profile");
        break;
      default:
        navigate("/profile");
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-slate-50 to-white backdrop-blur-md border-b border-slate-200/60 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen?.(true)}
          className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Section Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#093FB4] to-[#0F52BA] bg-clip-text text-transparent">
          {currentSection}
        </h1>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 flex-1"
          />
        </div>
      </div>

      {/* Right Section: User Menu */}
      <div className="flex items-center space-x-4">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center space-x-2 pl-4 border-l border-slate-200 focus:outline-none">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={
                  data?.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    data?.firstName || "U"
                  )}&background=0B3A85&color=fff&size=128`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-800">
                {data?.firstName} {data?.lastName}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-slate-200 divide-y divide-slate-100 rounded-md shadow-lg focus:outline-none z-50">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleProfile}
                      className={`${
                        active ? "bg-blue-50" : ""
                      } group flex items-center w-full px-4 py-2 text-sm text-slate-700`}
                    >
                      <User className="w-4 h-4 mr-2 text-[#093FB4]" />
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? "bg-blue-50" : ""
                      } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <LogOut className="w-4 h-4 mr-2 text-red-500" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};
