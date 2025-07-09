import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { SpecializationModal } from "./SpecializationModal";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { specializationApi } from "../../feature/api/specializationApi";
import { useMemo, useState } from "react";

interface Specialization {
  id: string;
  name: string;
  description: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const SpecializationList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [showModal, setShowModal] = useState(false);

  const {
    data,
    error,
    isLoading,
  } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 10 });

  // ✅ Correct extraction based on your API response
  const specializations = data?.specializations ?? [];

  const mapStatus = (status: string): Specialization["status"] => {
    switch (status?.toLowerCase()) {
      case "active":
        return "active";
      case "inactive":
        return "inactive";
      default:
        return "active";
    }
  };

  const mappedSpecializations = useMemo(() =>
    specializations.map((item: any) => ({
      id: String(item.specializationId ?? item.id ?? ""),
      name: item.name ?? "Unknown",
      description: item.description ?? "No description available",
      status: mapStatus(item.status ?? "active"),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  , [specializations]);

  const getStatusBadge = (status: Specialization["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = useMemo(() => [
    { header: "Name", accessor: "name" as keyof Specialization },
    { header: "Description", accessor: "description" as keyof Specialization },
    { 
      header: "Status", 
      accessor: (row: Specialization) => {
        const status = row.status ?? "active";
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
            {formattedStatus}
          </span>
        );
      }
    },
    { 
      header: "Created", 
      accessor: (row: Specialization) => (
        <span className="text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
        </span>
      )
    },
    { 
      header: "Updated", 
      accessor: (row: Specialization) => (
        <span className="text-gray-600">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A"}
        </span>
      )
    },
  ], []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Specializations</h1>
          <p className="text-gray-600">Manage and view all medical specializations</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            + Create Specialization
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load specializations.</p>
      ) : mappedSpecializations.length === 0 ? (
        <p className="text-gray-500 italic">No specializations found.</p>
      ) : (
        <Table
          columns={columns}
          data={mappedSpecializations}
          selectable={true}
          emptyText="No specializations found."
        />
      )}

      <Modal
        title="Create Specialization"
        show={showModal}
        onClose={() => setShowModal(false)}
        width="max-w-xl"
      >
        <SpecializationModal onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};
