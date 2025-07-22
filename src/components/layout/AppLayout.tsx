import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const path = useLocation().pathname.split('/')[2] || 'dashboard';
  const currentSection = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 transition-all duration-300 md:ml-72 ml-0">
        {/* Header */}
        <Header currentSection={currentSection} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="p-6 bg-slate-50 min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
