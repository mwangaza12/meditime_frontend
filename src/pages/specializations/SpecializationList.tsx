import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { SpecializationModal } from "./SpecializationModal";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { specializationApi } from "../../feature/api/specializationApi";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";

interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SpecializationList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [showModal, setShowModal] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState<Specialization | null>(null);

  const {
    data,
    error,
    isLoading,
    refetch,
  } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 10 });

  const [deleteSpecialization] = specializationApi.useDeleteSpecializationMutation();

  const specializations = data?.specializations ?? [];

  const mappedSpecializations: Specialization[] = useMemo(
    () =>
      specializations.map((item: any) => ({
        id: String(item.specializationId ?? item.id ?? 0), // ✅ Ensure id is a string
        name: item.name ?? "Unknown",
        description: item.description ?? "No description available",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    [specializations]
  );

  const handleEdit = (specialization: Specialization) => {
    setEditingSpecialization(specialization);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This specialization will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteSpecialization(Number(id)).unwrap(); // 🔁 convert to number if needed
        Swal.fire("Deleted!", "Specialization has been deleted.", "success");
        refetch();
      } catch (err) {
        Swal.fire("Error", "Failed to delete specialization.", "error");
      }
    }
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessor: "name" as keyof Specialization },
      { header: "Description", accessor: "description" as keyof Specialization },
      {
        header: "Actions",
        accessor: (row: Specialization) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row)}
              className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage and view all medical specializations</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingSpecialization(null);
              setShowModal(true);
            }}
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
        title={editingSpecialization ? "Edit Specialization" : "Create Specialization"}
        show={showModal}
        onClose={() => setShowModal(false)}
        width="max-w-xl"
      >
        <SpecializationModal
          onClose={() => {
            setShowModal(false);
            setEditingSpecialization(null);
          }}
          specialization={editingSpecialization}
        />
      </Modal>
    </div>
  );
};
