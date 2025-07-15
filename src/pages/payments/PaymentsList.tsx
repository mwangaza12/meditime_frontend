import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";

import { Table, type Column } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { type RootState } from "../../app/store";
import { paymentApi } from "../../feature/api/paymentApi";

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  date: string;
  appointmentDate: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
}

export const PaymentsList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = { page, pageSize };

  const { data = [], error, isLoading } = isAdmin
    ? paymentApi.useGetAllPaymentsQuery(queryParams)
    : isDoctor
    ? paymentApi.useGetPaymentsByDoctorIdQuery(
        user?.userId ? { doctorId: user.userId } : skipToken
      )
    : paymentApi.useGetPaymentsByUserIdQuery(
        user?.userId ? { userId: user.userId, ...queryParams } : skipToken,
        { skip: !user }
      );

  const mappedPayments: Payment[] = useMemo(() => {
    const records = data?.data || data || [];

    return Array.isArray(records)
      ? records.flatMap((record: any) => {
          // For admin: root-level payment object with embedded appointment
          if (record.appointment) {
            const appointment = record.appointment;
            const patientUser = appointment?.user;
            const doctorUser = appointment?.doctor?.user;
            const specialization = appointment?.doctor?.specialization;

            return [
              {
                id: String(record.paymentId),
                patientName: patientUser
                  ? `${patientUser.firstName} ${patientUser.lastName}`
                  : "N/A",
                doctorName: doctorUser
                  ? `${doctorUser.firstName} ${doctorUser.lastName}`
                  : "N/A",
                doctorSpecialization: specialization?.name || "N/A",
                amount: Number(record.amount),
                status: record.paymentStatus || "pending",
                date: record.createdAt || "",
                appointmentDate:
                  appointment?.appointmentDate || appointment?.createdAt || "N/A",
              },
            ];
          }

          // For doctor or user: appointment object with payments[]
          const appointment = record;
          const patientUser = appointment?.user;
          const doctorUser = appointment?.doctor?.user;
          const specialization = appointment?.doctor?.specialization;

          return (appointment.payments || []).map((payment: any) => ({
            id: String(payment.paymentId),
            patientName: patientUser
              ? `${patientUser.firstName} ${patientUser.lastName}`
              : "N/A",
            doctorName: doctorUser
              ? `${doctorUser.firstName} ${doctorUser.lastName}`
              : "N/A",
            doctorSpecialization: specialization?.name || "N/A",
            amount: Number(payment.amount),
            status: payment.paymentStatus || "pending",
            date: payment.createdAt || "",
            appointmentDate:
              appointment?.appointmentDate || appointment?.createdAt || "N/A",
          }));
        })
      : [];
  }, [data]);

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: Column<Payment>[] = useMemo(
    () => [
      { header: "Patient", accessor: "patientName" },
      { header: "Doctor", accessor: "doctorName" },
      { header: "Specialization", accessor: "doctorSpecialization" },
      {
        header: "Appointment Date",
        accessor: (row) =>
          row.appointmentDate !== "N/A"
            ? new Date(row.appointmentDate).toLocaleDateString()
            : "N/A",
      },
      {
        header: "Paid On",
        accessor: (row) =>
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
      },
      {
        header: "Amount",
        accessor: (row) => `$. ${row.amount.toFixed(2)}`,
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
    ],
    []
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
          <p className="text-gray-600">
            View all payments associated with your appointments
          </p>
        </div>
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

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load payments.</p>
      ) : mappedPayments.length === 0 ? (
        <p className="text-gray-500 italic">No payments found.</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={mappedPayments}
            selectable
            emptyText="No payments found."
          />

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={page === 1}
            >
              Previous
            </button>

            <span className="text-gray-700">Page {page}</span>

            <button
              onClick={() => handlePageChange(page + 1)}
              className="px-4 py-2 bg-gray-200 rounded"
              disabled={mappedPayments.length < pageSize}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
