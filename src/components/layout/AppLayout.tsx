import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const path = useLocation().pathname.split('/')[2] || 'dashboard';
  const currentSection = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-72 flex flex-col flex-1">
        
        {/* Header */}
        <Header currentSection={currentSection} />

        {/* Page Content */}
        <main className="p-6 bg-slate-50 min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
