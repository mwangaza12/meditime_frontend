import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { type RootState } from "../../app/store";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { Table } from "../../components/table/Table";
import { Spinner } from "../../components/loader/Spinner";
import { Users, CalendarCheck, Clock } from "lucide-react";
import Swal from "sweetalert2";

interface Patient {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  lastVisit: Date;
  visitCount: number;
}

export const PatientList = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data = [],
    isLoading,
    isError,
  } = appointmentApi.useDoctorPatientsQuery(
    user?.userId ? { doctorId: user.userId } : undefined
  );

  const [search, setSearch] = useState("");
  const today = new Date();

  const mappedPatients = useMemo(() => {
    const map = new Map<number, Patient>();

    data.forEach((appointment: any) => {
      const u = appointment.user;
      const userId = u.userId;
      const appointmentDate = new Date(appointment.appointmentDate);

      // Ignore future appointments
      if (appointmentDate > today) return;

      if (!map.has(userId)) {
        map.set(userId, {
          userId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          profileImageUrl: u.profileImageUrl,
          lastVisit: appointmentDate,
          visitCount: 1,
        });
      } else {
        const existing = map.get(userId)!;
        existing.visitCount += 1;

        if (appointmentDate > existing.lastVisit) {
          existing.lastVisit = appointmentDate;
        }
      }
    });

    // Filter by search term
    return Array.from(map.values()).filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor: (row: Patient) => `${row.firstName} ${row.lastName}`,
      },
      {
        header: "Email",
        accessor: "email" as keyof Patient,
      },
      {
        header: "Last Visit",
        accessor: (row: Patient) =>
          row.lastVisit instanceof Date
            ? row.lastVisit.toLocaleDateString()
            : "N/A",
      },
      {
        header: "Visits",
        accessor: "visitCount" as keyof Patient,
      },
    ],
    []
  );

  const totalPatients = mappedPatients.length;
  const totalAppointments = data.filter(
    (a: any) => new Date(a.appointmentDate) <= today
  ).length;

  const mostRecentVisit =
    mappedPatients.length > 0
      ? new Date(
          Math.max(...mappedPatients.map((p) => p.lastVisit.getTime()))
        ).toLocaleDateString()
      : "N/A";

  const handleDownloadCSV = async () => {
    const result = await Swal.fire({
      title: "Generate Patient Report?",
      text: "This will download a CSV of all patient visits.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Generate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });

    if (result.isConfirmed) {
      const headers = ["Full Name", "Email", "Last Visit", "Visits"];
      const rows = mappedPatients.map((p) => [
        `${p.firstName} ${p.lastName}`,
        p.email,
        p.lastVisit.toLocaleDateString(),
        p.visitCount,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map(String).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "patient_report.csv");
      link.click();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative rounded-xl bg-blue-100 p-4 shadow-sm">
          <div className="absolute top-4 right-4 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500">Total Patients</p>
          <p className="text-3xl font-bold text-blue-800">{totalPatients}</p>
        </div>

        <div className="relative rounded-xl bg-green-100 p-4 shadow-sm">
          <div className="absolute top-4 right-4 text-green-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500">Total Appointments</p>
          <p className="text-3xl font-bold text-green-800">{totalAppointments}</p>
        </div>

        <div className="relative rounded-xl bg-purple-100 p-4 shadow-sm">
          <div className="absolute top-4 right-4 text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500">Most Recent Visit</p>
          <p className="text-3xl font-bold text-purple-800">{mostRecentVisit}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div>
        <p className="mb-4 text-gray-600">List of patients seen</p>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-red-500">Failed to load patients.</p>
        ) : mappedPatients.length === 0 ? (
          <p className="text-gray-500 italic">No patients found.</p>
        ) : (
          <Table
            columns={columns}
            data={mappedPatients}
            selectable={false}
            emptyText="No patients found."
          />
        )}
      </div>
    </div>
  );
};
