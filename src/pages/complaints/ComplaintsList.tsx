import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { complaintApi } from "../../feature/api/complaintApi";
import { Spinner } from "../../components/loader/Spinner";
import { type RootState } from "../../app/store";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
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
        unreadCount: item.unreadCount || 0, // 👈 unread count
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="text-gray-600">
          {isAdmin
            ? "Manage all patient complaints"
            : "View and submit your complaints"}
        </p>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "All Complaints", status: "all", count: mappedComplaints.length, icon: <Filter className="w-6 h-6 text-blue-800" /> },
            { label: "Open", status: "open", count: statusStats.open, icon: <AlertCircle className="w-6 h-6 text-gray-800" /> },
            { label: "In Progress", status: "inProgress", count: statusStats.inProgress, icon: <Clock className="w-6 h-6 text-yellow-600" /> },
            { label: "Resolved", status: "resolved", count: statusStats.resolved, icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
            { label: "Closed", status: "closed", count: statusStats.closed, icon: <XCircle className="w-6 h-6 text-red-600" /> },
          ].map(({ label, status, count, icon }) => (
            <div
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`cursor-pointer p-4 rounded-xl shadow-sm flex items-center justify-between ${
                statusFilter === status
                  ? {
                      all: "bg-blue-100",
                      open: "bg-gray-100",
                      inProgress: "bg-yellow-100",
                      resolved: "bg-green-100",
                      closed: "bg-red-100",
                    }[status]
                  : "bg-white"
              }`}
            >
              <div>
                <p className="text-sm text-slate-600">{label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
              {icon}
            </div>
          ))}
        </div>

        {/* List */}
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
          <div className="divide-y rounded-xl border border-gray-200 bg-white shadow-sm">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  navigate(
                    isAdmin
                      ? `/dashboard/complaints/${complaint.id}`
                      : `/user-dashboard/complaints/${complaint.id}`
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      complaint.status === "resolved"
                        ? "bg-green-200 text-green-800"
                        : complaint.status === "closed"
                        ? "bg-red-200 text-red-800"
                        : complaint.status === "inProgress"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {complaint.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col max-w-xs md:max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{complaint.subject}</span>
                      {complaint.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {complaint.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 truncate">
                      {complaint.complaintText}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {complaint.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {isAdmin && filteredComplaints.length > 0 && (
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
      </div>
    </div>
  );
};
