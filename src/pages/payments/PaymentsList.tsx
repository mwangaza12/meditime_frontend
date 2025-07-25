import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { 
  CreditCard, 
  Calendar, 
  User, 
  Stethoscope, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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

  // Payment statistics
  const paymentStats = useMemo(() => {
    const total = mappedPayments.length;
    const completed = mappedPayments.filter(p => p.status === "completed").length;
    const pending = mappedPayments.filter(p => p.status === "pending").length;
    const failed = mappedPayments.filter(p => p.status === "failed").length;
    const totalAmount = mappedPayments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { total, completed, pending, failed, totalAmount };
  }, [mappedPayments]);

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = "" }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    prefix?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      {/* Header with status and amount */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(payment.status)}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          ${payment.amount.toFixed(2)}
        </div>
      </div>

      {/* Patient and Doctor info */}
      <div className="space-y-3 mb-3">
        <div className="flex items-start space-x-3">
          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              Patient: {payment.patientName}
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              Dr. {payment.doctorName}
            </p>
            {payment.doctorSpecialization !== "N/A" && (
              <p className="text-xs text-gray-500 truncate">
                {payment.doctorSpecialization}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Appointment</p>
            <p className="text-sm font-medium text-gray-900">
              {payment.appointmentDate !== "N/A"
                ? new Date(payment.appointmentDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Paid On</p>
            <p className="text-sm font-medium text-gray-900">
              {payment.date ? new Date(payment.date).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
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

  const getErrorMessage = (error: any): string => {
    if (!error) return "Unknown error occurred.";
    if (typeof error === "string") return error;
    if (typeof error.data === "string") return error.data;
    if (typeof error.data?.message === "string") return error.data.message;
    return "Failed to load payments.";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            View all payments associated with your appointments
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 lg:mb-8">
          <StatCard 
            title="Total Payments" 
            value={paymentStats.total} 
            icon={CreditCard} 
            color="bg-blue-50 text-blue-600" 
          />
          <StatCard 
            title="Completed" 
            value={paymentStats.completed} 
            icon={CheckCircle} 
            color="bg-green-50 text-green-600" 
          />
          <StatCard 
            title="Pending" 
            value={paymentStats.pending} 
            icon={Clock} 
            color="bg-yellow-50 text-yellow-600" 
          />
          <StatCard 
            title="Failed" 
            value={paymentStats.failed} 
            icon={XCircle} 
            color="bg-red-50 text-red-600" 
          />
          <StatCard 
            title="Total Amount" 
            value={paymentStats.totalAmount.toFixed(2)} 
            icon={CreditCard} 
            color="bg-emerald-50 text-emerald-600" 
            prefix="$"
          />
        </div>

        {/* Controls and Content Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Controls */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-blue-800">Payment Records</h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* View Mode Toggle - Mobile Only */}
                <div className="flex sm:hidden">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 text-xs rounded-l-md border ${
                      viewMode === 'cards' 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-xs rounded-r-md border-t border-r border-b ${
                      viewMode === 'table' 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Table
                  </button>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Page Size:</label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="text-sm border-gray-300 rounded-md px-2 py-1 min-w-0"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600 mb-2">Failed to load payments</p>
              <p className="text-gray-500">{getErrorMessage(error)}</p>
            </div>
          ) : mappedPayments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">No payments found</p>
              <p className="text-gray-500">Payment records will appear here once transactions are made</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className={`${viewMode === 'cards' ? 'block sm:hidden' : 'hidden'} p-4`}>
                {mappedPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className={`${viewMode === 'table' ? 'block' : 'hidden sm:block'}`}>
                <Table
                  columns={columns}
                  data={mappedPayments}
                  selectable
                  emptyText="No payments found."
                />
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={mappedPayments.length < pageSize}
                    className="flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                
                <span className="text-xs sm:text-sm text-gray-600">
                  Page {page} • Showing {mappedPayments.length} records
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};