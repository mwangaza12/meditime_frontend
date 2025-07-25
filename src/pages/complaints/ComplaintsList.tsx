import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { complaintApi } from "../../feature/api/complaintApi";
import { type RootState } from "../../app/store";

interface Complaint {
  id: string;
  userName: string;
  appointmentDate: string;
  subject: string;
  complaintText: string;
  status: "open" | "inProgress" | "resolved" | "closed";
  createdAt: string;
}

export const ComplaintsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const {
    data: allComplaints = [],
    error: adminError,
    isLoading: adminLoading,
  } = complaintApi.useGetAllComplaintsQuery(
    { page: 1, pageSize: 10 },
    { skip: !isAdmin }
  );

  const {
    data: userComplaints = [],
    error: userError,
    isLoading: userLoading,
  } = complaintApi.useGetUserComplaintsQuery(user?.userId, {
    skip: isAdmin || !user?.userId,
  });

  const [changeStatus] = complaintApi.useChangeComplaintStatusMutation();

  const complaintsData = isAdmin ? allComplaints : userComplaints;
  const isLoading = isAdmin ? adminLoading : userLoading;
  const error = isAdmin ? adminError : userError;

  const isEmptyError =
    (error as any)?.error === "No complaints found" ||
    (error as any)?.data?.message === "No complaints found";

  const mapStatus = (status: string): Complaint["status"] => {
    switch (status?.toLowerCase()) {
      case "inprogress":
        return "inProgress";
      case "resolved":
        return "resolved";
      case "closed":
        return "closed";
      case "open":
      default:
        return "open";
    }
  };

  const mappedComplaints: Complaint[] = useMemo(
    () =>
      (complaintsData || []).map((item: any) => ({
        id: String(item.complaintId),
        userName:
          `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim() || "Unknown",
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
      case "open":
        return "bg-gray-100 text-gray-800";
      case "inProgress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
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
        accessor: (row: Complaint) => {
          if (isAdmin) {
            return (
              <select
                value={row.status}
                onChange={async (e) => {
                  const newStatus = e.target.value as Complaint["status"];
                  try {
                    await changeStatus({ complaintId: row.id, status: newStatus });
                  } catch (err) {
                    console.error("Failed to update status", err);
                  }
                }}
                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white"
              >
                {["open", "inProgress", "resolved", "closed"].map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </option>
                ))}
              </select>
            );
          }

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                row.status
              )}`}
            >
              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            </span>
          );
        },
      },
      { header: "Created At", accessor: (row: Complaint) => row.createdAt },
      {
        header: "Actions",
        accessor: (row: Complaint) => (
          <button
            onClick={() =>
              navigate(
                isAdmin
                  ? `/dashboard/complaints/${row.id}`
                  : `/user-dashboard/complaints/${row.id}`
              )
            }
            className="text-blue-600 hover:underline text-sm whitespace-nowrap"
          >
            Chat
          </button>
        ),
      },
    ],
    [navigate, isAdmin, changeStatus]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {isAdmin
                ? "Manage all patient complaints"
                : "View and submit your complaints"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isEmptyError || mappedComplaints.length === 0 ? (
          <p className="text-gray-500 italic">
            {isAdmin
              ? "No complaints found."
              : "You have not submitted any complaints yet."}
          </p>
        ) : error ? (
          <p className="text-red-500">Failed to load complaints.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <Table
              columns={columns}
              data={mappedComplaints}
              selectable={isAdmin}
              emptyText="No complaints found."
            />
          </div>
        )}
      </div>
    </div>
  );
};
