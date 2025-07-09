import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Table } from '../../components/table/Table';
import { doctorApi } from '../../feature/api/doctorApi';
import { Spinner } from '../../components/loader/Spinner';
import { DoctorModal } from './DoctorModal';

interface DoctorListProps {
  source: 'doctors' | 'users';
}

interface Doctor {
  id: number;
  specialization: string;
  availableDays: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    contactPhone: string;
  };
}

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
}

export const DoctorList: React.FC<DoctorListProps> = ({ source }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const isDoctors = source === 'doctors';

  const doctorQuery = doctorApi.useGetAllDoctorsQuery({ page, pageSize });
  const userQuery = doctorApi.useGetUserDoctorsQuery({ page, pageSize });

  // Step 1: Build doctors list
  const doctors: Doctor[] = (doctorQuery.data?.doctors ?? []).map((doc: any) => ({
    id: doc.id ?? doc.doctorId ?? doc.userId ?? 0,
    specialization: doc.specialization ?? 'N/A',
    availableDays: doc.availableDays ?? 'N/A',
    user: {
      firstName: doc.user?.firstName ?? doc.firstName ?? '',
      lastName: doc.user?.lastName ?? doc.lastName ?? '',
      email: doc.user?.email ?? doc.email ?? '',
      contactPhone: doc.user?.contactPhone ?? doc.contactPhone ?? '',
    },
  }));

  // Step 2: Extract existing doctor userIds
  const doctorUserIds = new Set<number>(doctors.map(d => d.id));

  // Step 3: Build users list, filtering out those who are already doctors
  const users: User[] = (userQuery.data?.doctors ?? [])
    .filter((u: any) => !doctorUserIds.has(u.userId ?? 0))  // ✅ Filter out doctors
    .map((u: any) => ({
      userId: u.userId ?? 0,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      contactPhone: u.contactPhone ?? '',
      address: u.address ?? 'N/A',
      createdAt: u.createdAt ?? '',
    }));

  const totalCount = isDoctors
    ? doctorQuery.data?.total ?? doctors.length
    : userQuery.data?.total ?? users.length;

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor({
      id: doctor.id,
      userId: doctor.id,
      specialization: doctor.specialization,
      contactPhone: doctor.user.contactPhone,
      availableDays: doctor.availableDays,
    });
    setShowModal(true);
  };

  const handleCreateDoctorFromUser = (user: User) => {
    setSelectedDoctor({
      userId: user.userId,
      specialization: '',
      contactPhone: user.contactPhone || '',
      availableDays: '',
    });
    setShowModal(true);
  };

  const doctorColumns = [
    { header: 'Doctor', accessor: (d: Doctor) => <span>{d.user.firstName} {d.user.lastName}</span> },
    { header: 'Specialization', accessor: (d: Doctor) => <span>{d.specialization}</span> },
    { header: 'Contact', accessor: (d: Doctor) => <span>{d.user.contactPhone}</span> },
    { header: 'Email', accessor: (d: Doctor) => <span>{d.user.email}</span> },
    { header: 'Available Days', accessor: (d: Doctor) => <span>{d.availableDays}</span> },
    {
      header: 'Actions',
      accessor: (d: Doctor) => (
        <div className="flex space-x-2">
          <button><Eye className="w-4 h-4 text-green-600" /></button>
          <button onClick={() => handleEditDoctor(d)}><Edit className="w-4 h-4 text-blue-600" /></button>
          <button><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      ),
    },
  ];

  const userColumns = [
    { header: 'User', accessor: (u: User) => <span>{u.firstName} {u.lastName}</span> },
    { header: 'Email', accessor: (u: User) => <span>{u.email}</span> },
    { header: 'Contact', accessor: (u: User) => <span>{u.contactPhone || 'N/A'}</span> },
    { header: 'Address', accessor: (u: User) => <span>{u.address || 'N/A'}</span> },
    { header: 'Joined', accessor: (u: User) => <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span> },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex space-x-2">
          <button><Eye className="w-4 h-4 text-green-600" /></button>
          <button onClick={() => handleCreateDoctorFromUser(u)}><Edit className="w-4 h-4 text-blue-600" /></button>
          <button><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      ),
    },
  ];

  const loading = isDoctors ? doctorQuery.isLoading : userQuery.isLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              Showing page {page} of {totalPages} — {totalCount} {isDoctors ? 'doctors' : 'users'}
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600">Page Size:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {isDoctors ? (
            <Table<Doctor>
              columns={doctorColumns}
              data={doctors}
              loading={doctorQuery.isLoading}
              emptyText="No doctors found."
            />
          ) : (
            <Table<User>
              columns={userColumns}
              data={users}
              loading={userQuery.isLoading}
              emptyText="No users found."
            />
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <DoctorModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDoctor(null);
          }}
          initialData={selectedDoctor}
          isEdit={isDoctors && selectedDoctor?.id != null}
        />
      )}
    </div>
  );
};
