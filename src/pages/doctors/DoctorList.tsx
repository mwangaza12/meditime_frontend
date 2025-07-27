import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Table } from '../../components/table/Table';
import { doctorApi } from '../../feature/api/doctorApi';
import { Spinner } from '../../components/loader/Spinner';
import { DoctorModal } from './DoctorModal';
import Swal from 'sweetalert2';

interface DoctorListProps {
  source: 'doctors' | 'users';
}

interface Doctor {
  doctorId: string;
  specialization: string;
  specializationId: number;
  availableDays: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    contactPhone: string;
  };
  bio: string;
  experienceYears: number;
}

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
}

interface DoctorForm {
  userId: number;
  specializationId: number;
  contactPhone: string;
  availableDays: string;
  bio: string;
  experienceYears: number;
}

export const DoctorList: React.FC<DoctorListProps> = ({ source }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<(DoctorForm & { id?: number }) | null>(null);

  const [deleteDoctor] = doctorApi.useDeleteDoctorMutation();
  const [demoteUser] = doctorApi.useDemoteUserFromDoctorMutation();

  const isDoctors = source === 'doctors';

  const doctorQuery = doctorApi.useGetAllDoctorsQuery({ page, pageSize });
  const userQuery = doctorApi.useGetUserDoctorsQuery({ page, pageSize });

  const doctors: Doctor[] = (doctorQuery.data?.doctors ?? []).map((doc: any) => ({
    doctorId: doc.doctorId ?? doc.id ?? doc.userId ?? 0,
    specialization:
      typeof doc.specialization === 'object' && doc.specialization !== null
        ? doc.specialization.name ?? 'N/A'
        : doc.specialization ?? 'N/A',
    specializationId:
      typeof doc.specialization === 'object' && doc.specialization !== null
        ? doc.specialization.id ?? 0
        : 0,
    availableDays: doc.availability?.[0]?.dayOfWeek ?? 'N/A',
    bio: doc.bio ?? '',
    experienceYears: doc.experienceYears ?? 0,
    user: {
      userId: doc.user?.userId ?? doc.userId ?? 0,
      firstName: doc.user?.firstName ?? doc.firstName ?? '',
      lastName: doc.user?.lastName ?? doc.lastName ?? '',
      email: doc.user?.email ?? doc.email ?? '',
      contactPhone: doc.user?.contactPhone ?? doc.contactPhone ?? '',
    },
  }));

  const doctorUserIds = new Set<number>(doctors.map((d) => d.user.userId));

  const users: User[] = (userQuery.data?.doctors ?? [])
    .filter((u: any) => !doctorUserIds.has(u.userId ?? 0))
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
      id: Number(doctor.doctorId),
      userId: doctor.user.userId,
      specializationId: doctor.specializationId,
      contactPhone: doctor.user.contactPhone,
      availableDays: doctor.availableDays,
      bio: doctor.bio,
      experienceYears: doctor.experienceYears,
    });
    setShowModal(true);
  };

  const handleCreateDoctorFromUser = (user: User) => {
    setSelectedDoctor({
      userId: Number(user.userId),
      specializationId: 0,
      contactPhone: user.contactPhone || '',
      availableDays: '',
      bio: '',
      experienceYears: 0,
    });
    setShowModal(true);
  };

  const handleDeleteDoctor = async (doctor: Doctor) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete Dr. ${doctor.user.firstName} ${doctor.user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteDoctor(doctor.doctorId).unwrap();
        await doctorQuery.refetch();
        Swal.fire('Deleted!', 'Doctor has been removed.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete doctor.', 'error');
      }
    }
  };

  const handleDeleteFromUser = async (user: User) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to remove ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await demoteUser({ id: user.userId, role: 'user' }).unwrap();
        await userQuery.refetch();
        Swal.fire('Deleted!', 'User has been removed.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete user.', 'error');
      }
    }
  };

  const doctorColumns = [
    {
      header: 'Doctor',
      accessor: (d: Doctor) => <span>{d.user.firstName} {d.user.lastName}</span>,
    },
    {
      header: 'Specialization',
      accessor: (d: Doctor) => <span>{d.specialization}</span>,
    },
    {
      header: 'Contact',
      accessor: (d: Doctor) => <span>{d.user.contactPhone}</span>,
    },
    {
      header: 'Email',
      accessor: (d: Doctor) => <span>{d.user.email}</span>,
    },
    {
      header: 'Available Days',
      accessor: (d: Doctor) => <span>{d.availableDays}</span>,
    },
    {
      header: 'Actions',
      accessor: (d: Doctor) => (
        <div className="flex space-x-2">
          <button><Eye className="w-4 h-4 text-green-600" /></button>
          <button onClick={() => handleEditDoctor(d)}><Edit className="w-4 h-4 text-blue-600" /></button>
          <button onClick={() => handleDeleteDoctor(d)}><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      header: 'User',
      accessor: (u: User) => <span>{u.firstName} {u.lastName}</span>,
    },
    {
      header: 'Email',
      accessor: (u: User) => <span>{u.email}</span>,
    },
    {
      header: 'Contact',
      accessor: (u: User) => <span>{u.contactPhone || 'N/A'}</span>,
    },
    {
      header: 'Address',
      accessor: (u: User) => <span>{u.address || 'N/A'}</span>,
    },
    {
      header: 'Joined',
      accessor: (u: User) => (
        <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex space-x-2">
          <button><Eye className="w-4 h-4 text-green-600" /></button>
          <button onClick={() => handleCreateDoctorFromUser(u)}><Edit className="w-4 h-4 text-blue-600" /></button>
          <button onClick={() => handleDeleteFromUser(u)}><Trash2 className="w-4 h-4 text-red-600" /></button>
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
              Page {page} of {totalPages} — {totalCount} {isDoctors ? 'doctors' : 'users'}
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
            <Table<Doctor & { id: string }>
              columns={doctorColumns}
              data={doctors.map((d) => ({ ...d, id: String(d.doctorId) }))}
              loading={doctorQuery.isLoading}
              emptyText="No doctors found."
            />

          ) : (
            <Table<User & { id: string }>
              columns={userColumns}
              data={users.map((u) => ({ ...u, id: String(u.userId) }))}
              loading={userQuery.isLoading}
              emptyText="No users found."
            />
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
