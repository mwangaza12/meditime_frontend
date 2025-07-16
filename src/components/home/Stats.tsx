import { Award, Heart, Shield } from 'lucide-react';

export const Stats = () => {
  const stats = [
    {
      icon: Award,
      value: '1,500+',
      label: 'Healthcare Providers',
      description: 'Verified medical professionals',
    },
    {
      icon: Heart,
      value: '98%',
      label: 'Patient Satisfaction',
      description: 'Exceptional care quality',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'HIPAA Compliant',
      description: 'Your data is secure',
    },
  ];

  return (
    <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                <Icon className="w-6 h-6 text-blue-800" />
              </div>
              <h6 className="text-4xl font-bold text-blue-800">{stat.value}</h6>
              <p className="mb-2 font-bold text-md text-gray-900">{stat.label}</p>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
