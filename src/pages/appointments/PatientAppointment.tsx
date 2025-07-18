import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

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
  startTime: string; // ISO string
  status: "pending" | "cancelled" | "confirmed";
  durationMinutes: number;
  totalAmount?: number;
  isPaid?: boolean;
}

export const PatientAppointment = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const {
    data: userData = [],
    error: userError,
    isLoading: userLoading,
  } = appointmentApi.useGetAppointmentsByUserIdQuery(
    user?.userId ? { userId: user.userId } : skipToken
  );

  const [changeStatus] = appointmentApi.useChangeAppointmentStatusMutation();

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
      userData.map((item: any): Appointment => {
        const dateStr = item.appointmentDate;
        const timeStr = item?.availability?.startTime;
        let startTime = "";

        if (dateStr && timeStr) {
          const [hours, minutes] = timeStr.split(":").map(Number);
          const date = new Date(dateStr);
          date.setHours(hours, minutes, 0, 0);
          startTime = date.toISOString();
        }

        return {
          id: String(item.appointmentId),
          patientName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim(),
          doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
          date: item.appointmentDate,
          startTime,
          status: mapStatus(item.appointmentStatus),
          durationMinutes: item.durationMinutes || 30,
          totalAmount: Number(item.totalAmount),
          isPaid: item.payments?.[0]?.paymentStatus === "completed",
        };
      }),
    [userData]
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
    setShowComplaintModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await changeStatus({
        appointmentId,
        status: "cancelled",
      }).unwrap();

      toast.success(response.message || "Appointment cancelled successfully");
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      const errorMessage =
        err?.data?.message || err?.error || "Failed to cancel appointment";
      toast.error(errorMessage);
    }
  };

  const canCancel = (appointment: Appointment) => {
    return appointment.status === "pending" || appointment.status === "confirmed";
  };

  const columns: Column<Appointment>[] = useMemo(
    () => [
      { header: "Doctor", accessor: "doctorName" },
      {
        header: "Date",
        accessor: (row) => new Date(row.date).toLocaleDateString(),
      },
      {
        header: "Time",
        accessor: (row) =>
          row.startTime
            ? new Date(row.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "N/A",
      },
      {
        header: "Duration",
        accessor: (row) => `${row.durationMinutes} min`,
      },
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
        header: "Payment",
        accessor: (row) => {
          const canPay =
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
        header: "Actions",
        accessor: (row) => (
          <div className="flex gap-2">
            {canCancel(row) && (
              <button
                onClick={() => handleCancelAppointment(row.id)}
                className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => handleOpenComplaint(row.id)}
              className="text-sm px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Complaint
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Appointments</h2>
        <p className="text-gray-600">View and manage your appointments</p>
      </div>

      {userLoading ? (
        <Spinner />
      ) : userError ? (
        <p className="text-red-500">Failed to load appointments.</p>
      ) : mappedAppointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 italic text-lg">No appointments found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Book your first appointment to get started.
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={mappedAppointments}
          selectable={false}
          emptyText="No appointments found."
        />
      )}

      {/* Complaint Modal */}
      {showComplaintModal && selectedAppointmentId && (
        <Modal
          title="Create Complaint"
          show={showComplaintModal}
          onClose={() => setShowComplaintModal(false)}
          width="max-w-xl"
        >
          <ComplaintModal
            appointmentId={selectedAppointmentId}
            onClose={() => setShowComplaintModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};
