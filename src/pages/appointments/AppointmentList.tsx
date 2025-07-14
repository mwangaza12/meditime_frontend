import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";

import { Table, type Column } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { type RootState } from "../../app/store";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { StripeCheckoutButton } from "../payments/StripeCheckoutButton";
import { Modal } from "../../components/modal/Modal";
import { ComplaintModal } from "../complaints/ComplaintModal";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "pending" | "cancelled" | "confirmed";
  durationMinutes: number;
  totalAmount?: number;
  isPaid?: boolean;
}

export const AppointmentList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const {
    data: allData = [],
    error: allError,
    isLoading: allLoading,
  } = appointmentApi.useGetAllAppointmentsQuery(
    { page: 1, pageSize: 10 },
    { skip: !isAdmin }
  );

  const {
    data: doctorData = [],
    error: doctorError,
    isLoading: doctorLoading,
  } = appointmentApi.useGetAppointmentsByDoctorIdQuery(
    user?.userId ? { doctorId: user.userId } : skipToken,
    { skip: !isDoctor }
  );

  const {
    data: userData = [],
    error: userError,
    isLoading: userLoading,
  } = appointmentApi.useGetAppointmentsByUserIdQuery(
    user?.userId ? { userId: user.userId } : skipToken,
    { skip: isAdmin || isDoctor }
  );

  const data = isAdmin ? allData : isDoctor ? doctorData : userData;
  const isLoading = isAdmin ? allLoading : isDoctor ? doctorLoading : userLoading;
  const error = isAdmin ? allError : isDoctor ? doctorError : userError;

  const mapStatus = (status: string): Appointment["status"] => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "pending";
      case "cancelled":
        return "cancelled";
      case "confirmed":
        return "confirmed";
      default:
        return "pending";
    }
  };

  const mappedAppointments: Appointment[] = useMemo(
    () =>
      data.map((item: any): Appointment => ({
        id: String(item.appointmentId),
        patientName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim(),
        doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
        date: item.appointmentDate,
        time: item.timeSlot,
        status: mapStatus(item.appointmentStatus),
        durationMinutes: item.durationMinutes || 30,
        totalAmount: Number(item.totalAmount),
        isPaid: item.payments?.[0]?.paymentStatus === "completed",
      })),
    [data]
  );

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenComplaint = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const columns: Column<Appointment>[] = useMemo(() => [
    { header: "Patient", accessor: "patientName" },
    { header: "Doctor", accessor: "doctorName" },
    {
      header: "Date",
      accessor: (row) => new Date(row.date).toLocaleDateString(),
    },
    { header: "Time", accessor: "time" },
    { header: "Duration", accessor: "durationMinutes" },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
            row.status
          )}`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: (row) =>
        typeof row.totalAmount === "number" ? `Ksh. ${row.totalAmount}` : "N/A",
    },
    {
      header: "Pay",
      accessor: (row) => {
        const isUser = !isAdmin && !isDoctor;
        const canPay =
          isUser &&
          row.status === "pending" &&
          typeof row.totalAmount === "number" &&
          !row.isPaid;

        return canPay ? (
          <StripeCheckoutButton amount={row.totalAmount!} appointmentId={row.id} />
        ) : row.isPaid ? (
          <span className="text-green-600 font-medium italic">Paid</span>
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        );
      },
    },
    {
      header: "Complaint",
      accessor: (row) => {
        const isUser = !isAdmin && !isDoctor;
        return isUser ? (
          <button
            onClick={() => handleOpenComplaint(row.id)}
            className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Raise Complaint
          </button>
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        );
      },
    },
  ], [isAdmin, isDoctor]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage and view all patient appointments</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load appointments.</p>
      ) : mappedAppointments.length === 0 ? (
        <p className="text-gray-500 italic">No appointments found.</p>
      ) : (
        <Table
          columns={columns}
          data={mappedAppointments}
          selectable
          emptyText="No appointments found."
        />
      )}

      {/* Modal at the root level */}
      {showModal && selectedAppointmentId && (
        <Modal
          title="Create Complaint"
          show={showModal}
          onClose={() => setShowModal(false)}
          width="max-w-xl"
        >
          <ComplaintModal
            appointmentId={selectedAppointmentId}  // <-- Pass appointment ID here
            onClose={() => setShowModal(false)}
          />
        </Modal>

      )}
    </div>
  );
};
