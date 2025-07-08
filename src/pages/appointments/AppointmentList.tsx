import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { AppointmentModal } from "./AppointmentModal";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { useMemo, useState } from "react";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "confirmed";
  type: string;
  totalAmount?: number;
}

export const AppointmentList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [showModal, setShowModal] = useState(false);

  const { data: adminData = [], error: adminError, isLoading: adminLoading } = appointmentApi.useGetAllAppointmentsQuery(
    { page: 1, pageSize: 10 },
    { skip: !isAdmin }
  );

  const { data: userData = [], error: userError, isLoading: userLoading } = appointmentApi.useGetAppointmentsByUserIdQuery(
    { userId: user?.userId },
    { skip: isAdmin }
  );

  const data = isAdmin ? adminData : userData;
  const isLoading = isAdmin ? adminLoading : userLoading;
  const error = isAdmin ? adminError : userError;

  const mapStatus = (status: string): Appointment["status"] => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "scheduled":
        return "scheduled";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "confirmed":
        return "confirmed";
      default:
        return "scheduled";
    }
  };

  const mappedAppointments = useMemo(() =>
    data.map((item: any) => ({
      id: String(item.appointmentId),
      patientName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim(),
      doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
      date: item.appointmentDate,
      time: item.timeSlot,
      status: mapStatus(item.appointmentStatus),
      type: item.doctor?.specialization || "Unknown",
      totalAmount: item.totalAmount || "No Amount",
    }))
  , [data]);

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = useMemo(() => [
    { header: "Patient", accessor: "patientName" as keyof Appointment },
    { header: "Doctor", accessor: "doctorName" as keyof Appointment },
    { header: "Date", accessor: (row: Appointment) => new Date(row.date).toLocaleDateString() },
    { header: "Time", accessor: "time" as keyof Appointment },
    { header: "Type", accessor: "type" as keyof Appointment },
    { header: "Status", accessor: (row: Appointment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    { header: "Amount", accessor: (row: Appointment) => (
        <span className="text-gray-600 italic">
          {typeof row.totalAmount === "number" ? `₹ ${row.totalAmount}` : row.totalAmount}
        </span>
      )
    },
  ], []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage and view all patient appointments</p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            + Create Appointment
          </button>
        )}
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
          selectable={true}
          emptyText="No appointments found."
        />
      )}

      <Modal
        title="Create Appointment"
        show={showModal}
        onClose={() => setShowModal(false)}
        width="max-w-xl"
      >
        <AppointmentModal onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};
