import { useState } from 'react';
import { DoctorList } from './DoctorList';

export const DoctorTabs = () => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'users'>('doctors');

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'doctors' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Doctors Table
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Users Table
          </button>
        </div>

        {/* Table */}
        <DoctorList source={activeTab} />
      </div>
    </div>
  );
};
