import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { useState, useMemo } from "react";
import { complaintApi } from "../../feature/api/complaintApi";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";

interface Complaint {
  id: string;
  userName: string;
  appointmentDate: string;
  subject: string;
  complaintText: string;
  status: "pending" | "resolved" | "rejected";
  createdAt: string;
}

export const ComplaintsList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [showModal, setShowModal] = useState(false);

  // Admin: fetch all complaints
  const { data: allComplaints = [], error: adminError, isLoading: adminLoading } = complaintApi.useGetAllComplaintsQuery(
    { page: 1, pageSize: 10 },
    { skip: !isAdmin }
  );

  // Regular User: fetch their own complaints
  const { data: userComplaints = [], error: userError, isLoading: userLoading } = complaintApi.useGetUserComplaintsQuery(
    user?.userId,
    { skip: isAdmin || !user?.userId }
  );

  const complaintsData = isAdmin ? allComplaints : userComplaints;
  const isLoading = isAdmin ? adminLoading : userLoading;
  const error = isAdmin ? adminError : userError;

  const mapStatus = (status: string): Complaint["status"] => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "resolved";
      case "rejected":
        return "rejected";
      case "pending":
      default:
        return "pending";
    }
  };

  const mappedComplaints: Complaint[] = useMemo(
    () =>
      (complaintsData || []).map((item: any) => ({
        id: String(item.complaintId),
        userName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim() || "Unknown",
        appointmentDate: item.appointment?.appointmentDate || "N/A",
        subject: item.subject || "No subject",
        complaintText: item.description || "No details provided",
        status: mapStatus(item.status),
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      })),
    [complaintsData]
  );

  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = useMemo(
    () => [
      { header: "User", accessor: "userName" as keyof Complaint },
      { header: "Subject", accessor: (row: Complaint) => row.subject },
      { header: "Appointment Date", accessor: (row: Complaint) => row.appointmentDate },
      { header: "Complaint", accessor: "complaintText" as keyof Complaint },
      {
        header: "Status",
        accessor: (row: Complaint) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
              row.status
            )}`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        ),
      },
      { header: "Created At", accessor: (row: Complaint) => row.createdAt },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaints</h1>
          <p className="text-gray-600">
            {isAdmin ? "Manage all patient complaints" : "View and submit your complaints"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load complaints.</p>
      ) : mappedComplaints.length === 0 ? (
        <p className="text-gray-500 italic">
          {isAdmin ? "No complaints found." : "You have not submitted any complaints yet."}
        </p>
      ) : (
        <Table
          columns={columns}
          data={mappedComplaints}
          selectable={isAdmin}
          emptyText="No complaints found."
        />
      )}
    </div>
  );
};
