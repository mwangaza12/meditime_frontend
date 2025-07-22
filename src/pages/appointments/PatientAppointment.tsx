import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";
import {Calendar,Clock,User,AlertCircle,X,CreditCard,Ban,BriefcaseMedical} from "lucide-react";
import { type RootState } from "../../app/store";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { StripeCheckoutButton } from "../payments/StripeCheckoutButton";
import { ComplaintModal } from "../complaints/ComplaintModal";
import { Modal } from "../../components/modal/Modal";
import type { Appointment } from "../../types/types";

export const PatientAppointment = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const {
    data: userData = { appointments: [], total: 0 },
    error: userError,
    isLoading: userLoading,
  } = appointmentApi.useGetAppointmentsByUserIdQuery(
    user?.userId ? { userId: user.userId, page, pageSize } : skipToken
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
      (userData.appointments || []).map((item: any): Appointment => {
        const dateStr = item.appointmentDate;
        const timeStr = item?.doctor?.availability?.[0]?.startTime;
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
          specialization: item?.doctor?.specialization?.name || "",
          doctor: item?.doctor?.user,
          date: item.appointmentDate,
          startTime,
          status: mapStatus(item.appointmentStatus),
          durationMinutes: item?.doctor?.availability?.[0]?.slotDurationMinutes || 30,
          totalAmount: Number(item.totalAmount),
          isPaid: item.payments?.[0]?.paymentStatus === "completed",
        };
      }),
    [userData]
  );

  const appointmentStats = useMemo(() => {
    const total = mappedAppointments.length;
    const confirmed = mappedAppointments.filter(a => a.status === "confirmed").length;
    const pending = mappedAppointments.filter(a => a.status === "pending").length;
    const cancelled = mappedAppointments.filter(a => a.status === "cancelled").length;
    const paid = mappedAppointments.filter(a => a.isPaid).length;
    return { total, confirmed, pending, cancelled, paid };
  }, [mappedAppointments]);

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleOpenComplaint = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await changeStatus({
        appointmentId,
        status: "cancelled",
      }).unwrap();
      toast.success(response.message || "Appointment cancelled successfully");
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.error || "Failed to cancel appointment";
      toast.error(errorMessage);
    }
  };

  const canCancel = (appointment: Appointment) =>
    appointment.status === "pending" || appointment.status === "confirmed";

  const StatCard = ({title,value,icon: Icon,color,}: {title: string;value: number;icon: any;color: string;}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      {/* Doctor Info */}
      <div className="flex items-start mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
          {appointment.doctor.profileImageUrl ? (
            <img
              src={appointment.doctor.profileImageUrl}
              alt="Doctor"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {appointment.doctorName}
          </div>
          {appointment.specialization && (
            <div className="text-xs text-gray-500 italic truncate">
              {appointment.specialization}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(appointment.status)}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500 block">Date</span>
          <span className="font-medium text-gray-900">
            {new Date(appointment.date).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Time</span>
          <span className="font-medium text-gray-900">
            {appointment.startTime
              ? new Date(appointment.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Amount and Duration */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500 block">Amount</span>
          <span className="font-medium text-gray-900">
            {typeof appointment.totalAmount === "number" ? `Ksh. ${appointment.totalAmount}` : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Duration</span>
          <span className="font-medium text-gray-900">
            {appointment.durationMinutes} min
          </span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mb-3">
        {!appointment.isPaid && appointment.status === "pending" && typeof appointment.totalAmount === "number" ? (
          <StripeCheckoutButton amount={appointment.totalAmount} appointmentId={appointment.id} />
        ) : appointment.isPaid ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            <CreditCard className="w-3 h-3 mr-1" />
            Paid
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Payment: N/A</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
        {canCancel(appointment) && (
          <button
            onClick={() => handleCancelAppointment(appointment.id)}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <Ban className="w-4 h-4 mr-1" />
            Cancel
          </button>
        )}
        <button
          onClick={() => handleOpenComplaint(appointment.id)}
          className="flex items-center px-3 py-2 text-sm text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Report
        </button>
      </div>
    </div>
  );

  const totalPages = Math.ceil(userData.total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your medical appointments and track their status
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 lg:mb-8">
          <StatCard title="Total" value={appointmentStats.total} icon={Calendar} color="bg-blue-50 text-blue-600" />
          <StatCard title="Confirmed" value={appointmentStats.confirmed} icon={BriefcaseMedical} color="bg-emerald-50 text-emerald-600" />
          <StatCard title="Pending" value={appointmentStats.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
          <StatCard title="Cancelled" value={appointmentStats.cancelled} icon={X} color="bg-red-50 text-red-600" />
          <StatCard title="Paid" value={appointmentStats.paid} icon={CreditCard} color="bg-green-50 text-green-600" />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-blue-800">Recent Appointments</h2>
              
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
                  <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="text-sm border-gray-300 rounded-md p-1 min-w-0"
                  >
                    {[5, 10, 25, 50].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {userLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : userError ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600 mb-2">Failed to load appointments</p>
              <p className="text-gray-500">Please try again later</p>
            </div>
          ) : mappedAppointments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">No appointments found</p>
              <p className="text-gray-500">Book your first appointment to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className={`${viewMode === 'cards' ? 'block sm:hidden' : 'hidden'} p-4`}>
                {mappedAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className={`${viewMode === 'table' ? 'block' : 'hidden sm:block'}`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Duration</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Payment</th>
                        <th className="px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mappedAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          {/* Doctor cell */}
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3 overflow-hidden flex-shrink-0">
                                {appointment.doctor.profileImageUrl ? (
                                  <img
                                    src={appointment.doctor.profileImageUrl}
                                    alt="Doctor"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {appointment.doctorName}
                                </div>
                                {appointment.specialization && (
                                  <div className="text-xs text-gray-500 italic truncate">
                                    {appointment.specialization}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {new Date(appointment.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {appointment.startTime
                              ? new Date(appointment.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "N/A"}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap hidden lg:table-cell">
                            {appointment.durationMinutes} min
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {typeof appointment.totalAmount === "number" ? `Ksh. ${appointment.totalAmount}` : "N/A"}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            {!appointment.isPaid && appointment.status === "pending" && typeof appointment.totalAmount === "number" ? (
                              <StripeCheckoutButton amount={appointment.totalAmount} appointmentId={appointment.id} />
                            ) : appointment.isPaid ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                <CreditCard className="w-3 h-3 mr-1" />
                                Paid
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {canCancel(appointment) && (
                                <button
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                  title="Cancel appointment"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenComplaint(appointment.id)}
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 p-1.5 rounded-md transition-colors"
                                title="Report issue"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Page {page} of {totalPages} ({userData.total} total)
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Complaint Modal */}
        {showModal && selectedAppointmentId && (
          <Modal
            title="Create Complaint"
            show={showModal}
            onClose={() => setShowModal(false)}
            width="max-w-xl"
          >
            <ComplaintModal
              appointmentId={selectedAppointmentId}
              onClose={() => setShowModal(false)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};