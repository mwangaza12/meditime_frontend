import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CalendarCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
        return {
          id: String(item.appointmentId),
          patientName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim(),
          doctorName: `${item.doctor?.user?.firstName || ""} ${item.doctor?.user?.lastName || ""}`.trim(),
          date: item.appointmentDate,
          time: availability.startTime || item.timeSlot || "N/A",
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
            a.time,
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

  const columns: Column<Appointment>[] = useMemo(() => {
    const baseColumns: Column<Appointment>[] = [
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



      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <TextInput
          label="Search by name"
          type="text"
          placeholder="Search..."
          name="search"
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
          onChange={(e) => setStartDate(e.target.value)}
        />

        <TextInput
          label="End Date"
          type="date"
          placeholder=""
          name="end"
          icon={<Calendar size={16} />}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setStartDate("");
            setEndDate("");
          }}
          className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-2 rounded"
        >
          Reset Filters
        </button>

        <button
          onClick={handleExportPDF}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded"
        >
          Export PDF
        </button>

        <>
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
        </>

      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load appointments.</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="text-gray-500 italic">No appointments found.</p>
      ) : (
        <Table
          columns={columns}
          data={filteredAppointments}
          selectable
          emptyText="No appointments found."
        />
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
