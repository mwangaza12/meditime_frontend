import { skipToken } from '@reduxjs/toolkit/query/react';
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { prescriptionApi } from "../../feature/api/prescriptionApi";
import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { PrescriptionModal } from "./PrescriptionModal";

interface Prescription {
  id: number;
  appointmentId: number;
  doctorName: string;
  patientName: string;
  notes: string;
  createdAt: string;
}

export const PrescriptionList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [showModal, setShowModal] = useState(false);

  // Fetch prescriptions based on user role
  const {
    data = [],
    isLoading,
    error,
  } = isAdmin
    ? prescriptionApi.useGetAllPrescriptionsQuery({ page: 1, pageSize: 10 })
    : isDoctor
    ? prescriptionApi.useGetPrescriptionsByDoctorIdQuery(
        user?.userId ? { doctorId: user.userId } : skipToken,
        { skip: !isDoctor }
      )
    : prescriptionApi.useGetPrescriptionsByUserIdQuery(
        user?.userId ? { userId: user.userId } : skipToken
      );

  const mappedPrescriptions = useMemo(
    () =>
      data.map((item: any) => ({
        id: item.prescriptionId,
        appointmentId: item.appointmentId,
        doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
        patientName: `${item.patient?.firstName || ""} ${item.patient?.lastName || ""}`.trim(),
        notes: item.notes || "No notes",
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      })),
    [data]
  );

  const columns = useMemo(
    () => [
      { header: "Patient", accessor: "patientName" as keyof Prescription },
      { header: "Doctor", accessor: "doctorName" as keyof Prescription },
      { header: "Appointment ID", accessor: "appointmentId" as keyof Prescription },
      { header: "Notes", accessor: "notes" as keyof Prescription },
      { header: "Date", accessor: "createdAt" as keyof Prescription },
    ],
    []
  );

  const noDataMessage =
    error && (error as any)?.data?.message === "No prescriptions found for this user.";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescriptions</h1>
          <p className="text-gray-600">View and manage all prescriptions</p>
        </div>

        {isDoctor && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            + Create Prescription
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : noDataMessage || mappedPrescriptions.length === 0 ? (
        <p className="text-gray-500 italic">No prescriptions found.</p>
      ) : error ? (
        <p className="text-red-500">Failed to load prescriptions.</p>
      ) : (
        <Table
          columns={columns}
          data={mappedPrescriptions}
          selectable={false}
          emptyText="No prescriptions found."
        />
      )}

      <Modal title="Create Prescription" show={showModal} onClose={() => setShowModal(false)} width="max-w-lg">
        <PrescriptionModal onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};
