import { useState } from "react";
import { Eye, Edit, Trash2, Phone } from "lucide-react";
import { Table } from "../../components/table/Table";
import { userApi } from "../../feature/api/userApi";
import { Spinner } from "../../components/loader/Spinner";
import { toast } from "react-hot-toast";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
  role: "admin" | "doctor" | "user";
}


export const UserList = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const { data, isLoading, refetch } = userApi.useGetAllUsersQuery({
    page,
    pageSize,
  });

  const users: User[] = Array.isArray(data) ? data as User[] : data?.users || [];
  const totalCount: number = data?.total ?? users.length;
  const totalPages: number = Math.ceil(totalCount / pageSize) || 1;

  const [updateUser] = userApi.useUpdateUserTypeMutation();

  const handleUserTypeChange = async (user: User, newRole: User["role"]) => {
    try {
      await updateUser({ id: user.userId, role: newRole }).unwrap();
      toast.success(`Updated ${user.firstName} ${user.lastName}'s role to ${newRole}`);
      refetch();
    } catch (error) {
      console.error("Failed to update user type:", error);
      toast.error("Failed to update user type.");
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const columns = [
    {
      header: "User",
      accessor: (user: User) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-medium text-sm">
              {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
            </span>
          </div>
          <div>
            <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-slate-600">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (user: User) => (
        <div className="flex items-center text-sm text-slate-600">
          <Phone className="w-4 h-4 mr-1" />
          {user.contactPhone || "N/A"}
        </div>
      ),
    },
    {
      header: "Address",
      accessor: (user: User) => user.address || "N/A",
    },
    {
      header: "Joined",
      accessor: (user: User) =>
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    },
    {
      header: "Role",
      accessor: (user: User) => (
        <select
          className="border border-gray-300 rounded p-1"
          value={user.role}
          onChange={(e) => handleUserTypeChange(user, e.target.value as User["role"])}
        >
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="user">User</option>
        </select>
      ),
    },
    {
      header: "Actions",
      accessor: () => (
        <div className="flex space-x-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              Showing page {page} of {totalPages} — {totalCount} users
            </p>
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

          <Table<User>
            columns={columns}
            data={users}
            loading={isLoading}
            emptyText="No users found."
            selectable
          />

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
