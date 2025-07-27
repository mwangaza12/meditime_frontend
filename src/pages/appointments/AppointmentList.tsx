import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CalendarCheck, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, type Column } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { TextInput } from "../../components/form/TextInput";
import { type RootState } from "../../app/store";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { StripeCheckoutButton } from "../payments/StripeCheckoutButton";
import { Modal } from "../../components/modal/Modal";
import { ComplaintModal } from "../complaints/ComplaintModal";
import toast from "react-hot-toast";
import { Search, Calendar } from "lucide-react";
import Swal from "sweetalert2";

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  doctor: {
    profileImageUrl: string;
  }
  specialization?: string;
  date: string;
  startTime: string;
  status: "pending" | "cancelled" | "confirmed";
  durationMinutes: number;
  totalAmount?: number;
  isPaid?: boolean;
  startDateTime: string | null,
}

export const AppointmentList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const csvLinkRef = useRef<any>(null);

  const {
    data: allData = [],
    error: allError,
    isLoading: allLoading,
  } = appointmentApi.useGetAllAppointmentsQuery(
    { page: 1, pageSize: 100 },
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
  const [deleteManyAppointments] = appointmentApi.useDeleteManyAppointmentsMutation();

  const [changeStatus] = appointmentApi.useChangeAppointmentStatusMutation();

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
      data.map((item: any): Appointment => {
        const availability = item.doctor?.availability?.[0] || {};
        const appointmentDate = item.appointmentDate;

        const startTime = item.startTime;

        // Combine date and time
        const startDateTime =
          appointmentDate && startTime
            ? `${appointmentDate}T${startTime}`
            : null;
        return {
          id: String(item.appointmentId),
          patientName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim(),
          doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
          date: item.appointmentDate,
          doctor: item?.doctor?.user,
          startTime,
          startDateTime,
          status: mapStatus(item.appointmentStatus),
          durationMinutes: availability.slotDurationMinutes || item.durationMinutes || 30,
          totalAmount: Number(item.totalAmount),
          isPaid: item.payments?.[0]?.paymentStatus === "completed",
        };
      }),
    [data]
  );

  const filteredAppointments = mappedAppointments.filter((appt) => {
    const matchesSearch =
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || appt.status === statusFilter;

    const appointmentDate = new Date(appt.date);
    const matchesStart = startDate ? new Date(startDate) <= appointmentDate : true;
    const matchesEnd = endDate ? new Date(endDate) >= appointmentDate : true;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });

  // Pagination calculations
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Filter change handlers that reset pagination
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Memoize the selection change handler to prevent unnecessary re-renders
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedAppointments(ids);
  }, []);

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

  const handleExportPDF = () => {
    Swal.fire({
      title: "Download PDF?",
      text: "This will export the filtered appointments as a PDF file.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, download",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [["Patient", "Doctor", "Date", "Time", "Status"]],
          body: filteredAppointments.map((a) => [
            a.patientName,
            a.doctorName,
            a.date,
            a.startTime,
            a.status,
          ]),
        });
        doc.save("appointments.pdf");

        Swal.fire("Downloaded!", "The PDF has been saved.", "success");
      }
    });
  };

  const handleExportCSV = () => {
    Swal.fire({
      title: "Download CSV?",
      text: "This will export the filtered appointments as a CSV file.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, download",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        csvLinkRef.current.link.click();
        Swal.fire("Downloaded!", "The CSV has been saved.", "success");
      }
    });
  };

  const handleOpenComplaint = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment["status"]) => {
    try {
      const response = await changeStatus({ appointmentId, status: newStatus }).unwrap();
      toast.success(response.message || "Status updated successfully");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || "Failed to update appointment status";
      toast.error(errorMessage);
    }
  };

  const handleDeleteSelected = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedAppointments.length} appointments? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteManyAppointments({ ids: selectedAppointments }).unwrap();
        toast.success(res.message || "Deleted successfully");
        setSelectedAppointments([]);
      } catch (err: any) {
        const errorMessage =
          err?.data?.message || err?.error || "Failed to delete appointments";
        toast.error(errorMessage);
      }
    }
  };

  const columns: Column<Appointment>[] = useMemo(() => {
    const baseColumns: Column<Appointment>[] = [
      { header: "Patient", accessor: "patientName" },
      { header: "Doctor", accessor: "doctorName" },
      {
        header: "Date",
        accessor: (row) => new Date(row.date).toLocaleDateString(),
      },
      { header: "Time", accessor: "startTime" },
      { header: "Duration", accessor: "durationMinutes" },
      {
        header: "Status",
        accessor: isDoctor
          ? (row) => (
              <select
                value={row.status}
                onChange={(e) =>
                  handleStatusChange(row.id, e.target.value as Appointment["status"])
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )
          : (row) => (
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
    ];

    if (!isAdmin && !isDoctor) {
      baseColumns.push({
        header: "Complaint",
        accessor: (row) => (
          <button
            onClick={() => handleOpenComplaint(row.id)}
            className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Raise Complaint
          </button>
        ),
      });
    }

    return baseColumns;
  }, [isAdmin, isDoctor]);

  const totalAppointments = filteredAppointments.length;
  const pendingCount = filteredAppointments.filter((a) => a.status === "pending").length;
  const confirmedCount = filteredAppointments.filter((a) => a.status === "confirmed").length;
  const cancelledCount = filteredAppointments.filter((a) => a.status === "cancelled").length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg relative">
          <CalendarCheck className="text-blue-600 w-6 h-6 absolute top-3 right-3" />
          <p className="text-blue-800 font-semibold">Total</p>
          <h3 className="text-2xl font-bold">{totalAppointments}</h3>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg relative">
          <Clock className="text-yellow-600 w-6 h-6 absolute top-3 right-3" />
          <p className="text-yellow-800 font-semibold">Pending</p>
          <h3 className="text-2xl font-bold">{pendingCount}</h3>
        </div>

        <div className="bg-green-100 p-4 rounded-lg relative">
          <CheckCircle2 className="text-green-600 w-6 h-6 absolute top-3 right-3" />
          <p className="text-green-800 font-semibold">Confirmed</p>
          <h3 className="text-2xl font-bold">{confirmedCount}</h3>
        </div>

        <div className="bg-red-100 p-4 rounded-lg relative">
          <XCircle className="text-red-600 w-6 h-6 absolute top-3 right-3" />
          <p className="text-red-800 font-semibold">Cancelled</p>
          <h3 className="text-2xl font-bold">{cancelledCount}</h3>
        </div>
      </div>

      <div className="flex flex-wrap justify-between mb-4 gap-4">
        <TextInput
          label="Search by name"
          type="text"
          placeholder="Search..."
          name="search"
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="block mt-1 px-3 py-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <TextInput
          label="Start Date"
          type="date"
          placeholder=""
          name="start"
          icon={<Calendar size={16} />}
          value={startDate}
          onChange={handleStartDateChange}
        />

        <TextInput
          label="End Date"
          type="date"
          placeholder=""
          name="end"
          icon={<Calendar size={16} />}
          value={endDate}
          onChange={handleEndDateChange}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">Items per page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="block mt-1 px-3 py-2 border rounded-md"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          onClick={handleResetFilters}
          className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-2 rounded"
        >
          Reset Filters
        </button>

        <div className="space-x-2">
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            Export CSV
          </button>

          <CSVLink
            ref={csvLinkRef}
            data={filteredAppointments}
            filename="appointments.csv"
            className="hidden"
            target="_blank"
          />
        </div>
        
        <button
          disabled={selectedAppointments.length === 0}
          onClick={handleDeleteSelected}
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Selected
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load appointments.</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="text-gray-500 italic">No appointments found.</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={paginatedAppointments}
            selectable
            emptyText="No appointments found."
            onSelectionChange={handleSelectionChange}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} appointments
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                      disabled={page === '...'}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : page === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
  );
};