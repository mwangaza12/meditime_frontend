import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { complaintApi } from "../../feature/api/complaintApi";
import { Spinner } from "../../components/loader/Spinner";
import { Table } from "../../components/table/Table";
import { type RootState } from "../../app/store";
import {AlertCircle,CheckCircle,Clock,XCircle,Filter,} from "lucide-react";
import type { Complaint } from "../../types/types";


export const ComplaintsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<Complaint["status"] | "all">("all");

  const {
    data: allComplaints = [],
    error: adminError,
    isLoading: adminLoading,
  } = complaintApi.useGetAllComplaintsQuery({ page, pageSize }, { skip: !isAdmin });

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

  const filteredComplaints = useMemo(() => {
    if (statusFilter === "all") return mappedComplaints;
    return mappedComplaints.filter((c) => c.status === statusFilter);
  }, [mappedComplaints, statusFilter]);

  const statusStats = useMemo(() => {
    return mappedComplaints.reduce(
      (acc, complaint) => {
        acc[complaint.status]++;
        return acc;
      },
      {
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      } as Record<Complaint["status"], number>
    );
  }, [mappedComplaints]);

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
      <div className="max-w-7xl mx-auto space-y-6">
        <p className="text-gray-600">
          {isAdmin
            ? "Manage all patient complaints"
            : "View and submit your complaints"}
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${statusFilter === "all" ? "bg-blue-100" : "bg-white"}`}
            onClick={() => setStatusFilter("all")}
          >
            <div>
              <p className="text-sm text-slate-600">All Complaints</p>
              <p className="text-2xl font-bold text-blue-800">{mappedComplaints.length}</p>
            </div>
            <Filter className="w-6 h-6 text-blue-800" />
          </div>

          <div
            className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${statusFilter === "open" ? "bg-gray-100" : "bg-white"}`}
            onClick={() => setStatusFilter("open")}
          >
            <div>
              <p className="text-sm text-slate-600">Open</p>
              <p className="text-2xl font-bold text-gray-800">{statusStats.open}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-gray-800" />
          </div>

          <div
            className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${statusFilter === "inProgress" ? "bg-yellow-100" : "bg-white"}`}
            onClick={() => setStatusFilter("inProgress")}
          >
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{statusStats.inProgress}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>

          <div
            className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${statusFilter === "resolved" ? "bg-green-100" : "bg-white"}`}
            onClick={() => setStatusFilter("resolved")}
          >
            <div>
              <p className="text-sm text-slate-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{statusStats.resolved}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          <div
            className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${statusFilter === "closed" ? "bg-red-100" : "bg-white"}`}
            onClick={() => setStatusFilter("closed")}
          >
            <div>
              <p className="text-sm text-slate-600">Closed</p>
              <p className="text-2xl font-bold text-red-600">{statusStats.closed}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Table */}
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
          <>
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <Table
                columns={columns}
                data={filteredComplaints}
                selectable={isAdmin}
                emptyText="No complaints found."
              />
            </div>

            {/* Pagination (for admin only) */}
            {isAdmin && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">Page {page}</span>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 border rounded"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
