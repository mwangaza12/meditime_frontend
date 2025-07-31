import React, { useState, useMemo } from "react";
import { Eye, Edit, Trash2, Phone, Search, Filter, Users, UserCheck, Shield, Grid, List } from "lucide-react";
import { Table } from "../../components/table/Table";
import { userApi } from "../../feature/api/userApi";
import { Spinner } from "../../components/loader/Spinner";
import { toast } from "react-hot-toast";
import { UserModal } from "./UserModal";

// --- UserModal component ---
export interface User {
  userId: string;
  profileImageUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone?: string;
  address?: string;
  createdAt?: string;
  role: "admin" | "doctor" | "user";
}

// --- UserList component ---
export const UserList = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const { data, isLoading, refetch } = userApi.useGetAllUsersQuery({ page:1, pageSize: 100 });
  console.log(data);
  const { data: userCount } = userApi.useGetAllUsersQuery({page: 1, pageSize: 100});

  const users: User[] = Array.isArray(data) ? data as User[] : data?.users || [];
  const totalCount: number = data?.total ?? users.length;

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages: number = Math.ceil(filteredUsers.length / pageSize) || 1;

  // Get paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Calculate role statistics
  const roleStats = useMemo(() => {
  const stats = { admin: 0, doctor: 0, user: 0, total: userCount?.total ?? users.length };
  users.forEach(user => {
    stats[user.role]++;
  });
  return stats;
}, [users, userCount]);


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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "doctor":
        return <UserCheck className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "doctor":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "doctor":
        return "Doctor";
      case "user":
        return "Patient";
      default:
        return role;
    }
  };

  const columns = [
    {
      header: "User",
      accessor: (user: User) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-medium">
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
              </div>
            )}
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
          className="border border-gray-300 rounded p-1 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          value={user.role}
          onChange={(e) => handleUserTypeChange(user, e.target.value as User["role"])}
        >
          <option value="admin">Administrator</option>
          <option value="doctor">Doctor</option>
          <option value="user">Patient</option>
        </select>
      ),
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <button
            className="p-1 text-blue-800 hover:bg-blue-50 rounded"
            onClick={() => handleViewUser(user)}
          >
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-800">{roleStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-800" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Administrators</p>
              <p className="text-2xl font-bold text-red-600">{roleStats.admin}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Doctors</p>
              <p className="text-2xl font-bold text-green-600">{roleStats.doctor}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Patients</p>
              <p className="text-2xl font-bold text-blue-600">{roleStats.user}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-1 focus:ring-blue-800 w-full md:w-64"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-1 focus:ring-blue-800 appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="doctor">Doctors</option>
                <option value="user">Patients</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg ${viewMode === "table" 
                ? "bg-blue-800 text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-lg ${viewMode === "cards" 
                ? "bg-blue-800 text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-600">
                Showing {filteredUsers.length} of {totalCount} users
                {searchQuery && ` matching "${searchQuery}"`}
                {roleFilter !== "all" && ` with role "${getRoleLabel(roleFilter)}"`}
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-slate-600">Page Size:</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border rounded px-2 py-1 text-sm focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === "table" ? (
              <Table<{ id: string } & User>
                columns={columns}
                data={paginatedUsers.map((user) => ({
                  ...user,
                  id: user.userId.toString(), // Convert userId to string to satisfy constraint
                }))}
                loading={isLoading}
                emptyText="No users found."
                selectable
              />

            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedUsers.map((user) => (
                  <div key={user.userId} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="User avatar"
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-800 text-white flex items-center justify-center text-lg font-medium mr-3">
                            {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-slate-800">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {user.contactPhone && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.contactPhone}
                        </div>
                      )}
                      {user.address && (
                        <p className="text-sm text-slate-600">{user.address}</p>
                      )}
                      {user.createdAt && (
                        <p className="text-sm text-slate-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <select
                        className="border border-gray-300 rounded p-1 text-sm focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                        value={user.role}
                        onChange={(e) => handleUserTypeChange(user, e.target.value as User["role"])}
                      >
                        <option value="admin">Administrator</option>
                        <option value="doctor">Doctor</option>
                        <option value="user">Patient</option>
                      </select>

                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-blue-800 hover:bg-blue-50 rounded"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Modal */}
        <UserModal
          show={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          user={selectedUser}
        />
      </div>
    </div>
  );
};