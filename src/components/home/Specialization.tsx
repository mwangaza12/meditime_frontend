import { useState } from 'react';
import { Heart, Brain, Eye, Bone, Baby, Stethoscope } from 'lucide-react';
import { specializationApi } from '../../feature/api/specializationApi';

const iconMap: Record<string, any> = {
  Cardiologist: Heart,
  Neurologist: Brain,
  Ophthalmologist: Eye,
  'Orthopedic Surgeon': Bone,
  Pediatrician: Baby,
  'General Medicine': Stethoscope,
};

const colorMap: Record<string, { color: string; bgColor: string }> = {
  Cardiologist: { color: 'text-blue-800', bgColor: 'bg-blue-50' },
  Neurologist: { color: 'text-blue-800', bgColor: 'bg-blue-50' },
  Ophthalmologist: { color: 'text-blue-800', bgColor: 'bg-blue-50' },
  'Orthopedic Surgeon': { color: 'text-blue-800', bgColor: 'bg-blue-50' },
  Pediatrician: { color: 'text-blue-800', bgColor: 'bg-blue-50' },
  'General Medicine': { color: 'text-blue-800', bgColor: 'bg-blue-50' },
};

export const Specialization = () => {
  const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
  const { data, isLoading } = specializationApi.useGetAllspecializationsQuery({});
  const specializations = data?.specializations || [];

  if (isLoading) {
    return <div className="text-center py-16">Loading specializations...</div>;
  }

  return (
    <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="flex flex-col lg:flex-row">
        {/* Left Section */}
        <div className="max-w-xl pr-0 lg:pr-16 mb-12 lg:mb-0">
          <h2 className="mb-6 text-3xl font-extrabold leading-tight text-gray-900">
            Discover Our <span className="text-blue-800">Specializations</span>
          </h2>
          <p className="mb-6 text-gray-700">
            Explore a wide range of healthcare services, each designed with expert care and supported by highly qualified professionals.
          </p>
          <div className="flex items-center">
            <button className="inline-flex items-center justify-center h-12 px-6 mr-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-blue-800 hover:bg-blue-900 focus:shadow-outline focus:outline-none">
              Get started
            </button>
            <a
              href="/"
              className="inline-flex items-center font-semibold text-blue-800 transition-colors duration-200 hover:text-blue-900"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* Right Grid */}
        <div className="grid gap-6 row-gap-6 sm:grid-cols-2">
          {specializations.map((spec: any) => {
            const IconComponent = iconMap[spec.name] || Stethoscope;
            const colors = colorMap[spec.name] || { color: 'text-blue-800', bgColor: 'bg-blue-50' };
            const isSelected = selectedSpecialization === spec.specializationId;

            return (
              <div
                key={spec.specializationId}
                onClick={() => setSelectedSpecialization(isSelected ? null : spec.specializationId)}
                className={`p-6 rounded-xl shadow hover:shadow-lg transition duration-300 cursor-pointer ${colors.bgColor} ${
                  isSelected ? 'ring-2 ring-blue-800' : ''
                }`}
              >
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white shadow">
                  <IconComponent className={`w-8 h-8 ${colors.color}`} />
                </div>
                <h4 className="mb-2 text-xl font-semibold text-gray-900">{spec.name}</h4>
                <p className="text-sm text-gray-700 mb-3">{spec.description}</p>
                <span className="inline-block px-3 py-1 text-sm font-medium text-gray-800 bg-white rounded-full shadow">
                  Doctors Available
                </span>

                {isSelected && (
                  <div className="mt-6">
                    <button className="w-full py-3 px-6 text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors font-medium">
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
