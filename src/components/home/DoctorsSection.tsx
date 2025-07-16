import { doctorApi } from "../../feature/api/doctorApi";

export const DoctorsSection = () => {
  const { data = { doctors: [] }, isLoading, error } = doctorApi.useGetAllDoctorsQuery({
    page: 1,
    pageSize: 6,
  });

  const displayDoctors = Array.isArray(data.doctors)
    ? data.doctors.map((doc: any) => ({
        id: doc.doctorId,
        name: `Dr. ${doc.user.firstName} ${doc.user.lastName}`,
        specialty: doc.specialization?.name || "Specialization not set",
        experience: `${doc.experienceYears} years experience`,
        image: doc.user?.profileImageUrl || "https://via.placeholder.com/80",
        location: doc.user?.address || "Not specified",
      }))
    : [];

  if (isLoading) return <p className="text-center">Loading doctors...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load doctors.</p>;

  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="mx-auto mb-10 lg:max-w-xl sm:text-center">
        <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-blue-800 uppercase rounded-full bg-blue-100">
          Our Doctors
        </p>
        <p className="text-base text-gray-700 md:text-lg">
          Our experienced medical professionals are here to provide the highest quality care for you and your family.
        </p>
      </div>

      <div className="grid gap-10 mx-auto lg:max-w-screen-lg sm:grid-cols-2 lg:grid-cols-4">
        {displayDoctors.map((doctor: any) => (
          <div key={doctor.id} className="flex flex-col items-center">
            <img
              className="object-cover w-20 h-20 mb-2 rounded-full shadow"
              src={doctor.image}
              alt={doctor.name}
            />
            <div className="flex flex-col items-center text-center">
              <p className="text-lg font-bold text-blue-800">{doctor.name}</p>
              <p className="text-sm text-gray-800">{doctor.specialty}</p>
              <p className="text-sm text-gray-500">{doctor.experience}</p>
              <p className="text-sm text-gray-500">{doctor.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
