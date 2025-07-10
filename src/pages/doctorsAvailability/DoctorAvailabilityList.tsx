import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { DoctorAvailabilityModal } from "./DoctorAvailabilityModal";
import { doctorAvailabilityApi } from "../../feature/api/doctorAvailabilityApi";
import { type Availability } from "../../types/types";


interface MappedAvailability {
  availabilityId: number;
  doctorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export const DoctorAvailabilityList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [showModal, setShowModal] = useState(false);

  const { data: allData, isLoading: allLoading, error: allError } = 
    doctorAvailabilityApi.useGetAllDoctorAvailabilityQuery(undefined, { skip: !isAdmin });

  const { data: doctorData, isLoading: doctorLoading, error: doctorError } = 
    doctorAvailabilityApi.useGetDoctorAvailabilityByDoctorIdQuery(user?.doctor?.doctorId ?? 0, { skip: !isDoctor });

  const data: Availability[] = isAdmin 
    ? allData?.availabilities ?? [] 
    : isDoctor 
      ? doctorData?.availabilities ?? [] 
      : [];

  const isLoading = isAdmin ? allLoading : isDoctor ? doctorLoading : false;
  const error = isAdmin ? allError : isDoctor ? doctorError : null;

  const mappedAvailability: MappedAvailability[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      availabilityId: item.availabilityId,
      doctorName: item.doctor?.user
        ? `${item.doctor.user.firstName} ${item.doctor.user.lastName}`
        : "N/A",
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      slotDurationMinutes: item.slotDurationMinutes,
    }));
  }, [data]);

  const columns = useMemo(() => [
    { header: "Doctor", accessor: "doctorName" as keyof MappedAvailability },
    { header: "Day", accessor: "dayOfWeek" as keyof MappedAvailability },
    { header: "Start Time", accessor: (row: MappedAvailability) => row.startTime.slice(0, 5) },
    { header: "End Time", accessor: (row: MappedAvailability) => row.endTime.slice(0, 5) },
    { header: "Slot Duration", accessor: (row: MappedAvailability) => `${row.slotDurationMinutes} min` },
  ], []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Availabilities</h1>
          <p className="text-gray-600">Manage and view doctor schedules</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            + Add Availability
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load availabilities.</p>
      ) : mappedAvailability.length === 0 ? (
        <p className="text-gray-500 italic">No availabilities found.</p>
      ) : (
        <Table<MappedAvailability>
          columns={columns}
          data={mappedAvailability}
          selectable={false}
          emptyText="No availabilities found."
        />
      )}

      <Modal
        title="Create Availability"
        show={showModal}
        onClose={() => setShowModal(false)}
        width="max-w-xl"
      >
        <DoctorAvailabilityModal onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};
