import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Modal } from "../../components/modal/Modal";
import { DoctorAvailabilityModal } from "./DoctorAvailabilityModal";
import { doctorAvailabilityApi } from "../../feature/api/doctorAvailabilityApi";
import { type Availability } from "../../types/types";
import { Search } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";

interface MappedAvailability {
  availabilityId: number;
  doctorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DoctorAvailabilityList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [searchName, setSearchName] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [startTimeFilter, setStartTimeFilter] = useState("");

  const { data: allData, isLoading: allLoading, error: allError } =
    doctorAvailabilityApi.useGetAllDoctorAvailabilityQuery(undefined, { skip: !isAdmin });

  const { data: doctorData, isLoading: doctorLoading, error: doctorError } =
    doctorAvailabilityApi.useGetDoctorAvailabilityByDoctorIdQuery(
      user?.doctor?.doctorId ?? 0,
      { skip: !isDoctor }
    );

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

  const filteredData = useMemo(() => {
    return mappedAvailability.filter((item) => {
      const matchesName = item.doctorName.toLowerCase().includes(searchName.toLowerCase());
      const matchesDay = selectedDay === "all" || item.dayOfWeek === selectedDay;
      const matchesTime = !startTimeFilter || item.startTime.startsWith(startTimeFilter);
      return matchesName && matchesDay && matchesTime;
    });
  }, [mappedAvailability, searchName, selectedDay, startTimeFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const columns = useMemo(
    () => [
      { header: "Doctor", accessor: "doctorName" as keyof MappedAvailability },
      { header: "Day", accessor: "dayOfWeek" as keyof MappedAvailability },
      {
        header: "Start Time",
        accessor: (row: MappedAvailability) => row.startTime.slice(0, 5),
      },
      {
        header: "End Time",
        accessor: (row: MappedAvailability) => row.endTime.slice(0, 5),
      },
      {
        header: "Slot Duration",
        accessor: (row: MappedAvailability) => `${row.slotDurationMinutes} min`,
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">Manage and view doctor schedules</p>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            + Add Availability
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <TextInput
          label="Search Doctor"
          type="text"
          placeholder="Enter doctor name"
          icon={<Search size={16} />}
          name="searchName"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Day Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Day
          </label>
          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-48"
          >
            <option value="all">All Days</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time (9AM–6PM)
          </label>
          <select
            name="startTime"
            value={startTimeFilter}
            onChange={(e) => {
              setStartTimeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-48"
          >
            <option value="">All Times</option>
            {Array.from({ length: 10 }, (_, i) => {
              const hour = 9 + i;
              const timeStr = hour.toString().padStart(2, "0") + ":00";
              return (
                <option key={timeStr} value={timeStr}>
                  {timeStr}
                </option>
              );
            })}
          </select>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            setSearchName("");
            setSelectedDay("all");
            setStartTimeFilter("");
            setCurrentPage(1);
          }}
          className="text-sm text-blue-600 underline mt-6"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Failed to load availabilities.</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500 italic">No availabilities found.</p>
      ) : (
        <>
          <Table<MappedAvailability>
            columns={columns}
            data={paginatedData}
            selectable={false}
            emptyText="No availabilities found."
          />

          {/* Pagination */}
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
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
