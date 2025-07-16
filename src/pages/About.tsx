import {
  Heart,
  Shield,
  Users,
  Clock,
  Award,
  CheckCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

type ColorKey = 'red' | 'blue' | 'green' | 'purple';

export const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description:
        'Every decision we make prioritizes patient well-being and quality care delivery.',
      color: 'red' as ColorKey,
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description:
        'HIPAA-compliant platform ensuring your medical data is always protected.',
      color: 'blue' as ColorKey,
    },
    {
      icon: Users,
      title: 'Accessibility',
      description:
        'Making healthcare accessible to everyone, anywhere, at any time.',
      color: 'green' as ColorKey,
    },
    {
      icon: Clock,
      title: 'Efficiency',
      description:
        'Streamlining healthcare processes to save time for both patients and providers.',
      color: 'purple' as ColorKey,
    },
  ];

  const achievements = [
    '75,000+ Patients Served',
    '1,500+ Healthcare Providers',
    '250,000+ Appointments Scheduled',
    '99.9% Platform Uptime',
    'HIPAA Compliant',
    '24/7 Support Available',
  ];

  const getColorClasses = (color: ColorKey): string => {
    const colorMap: Record<ColorKey, string> = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colorMap[color];
  };

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-1 rounded-full mb-6 text-sm font-medium">
            <Heart className="w-4 h-4 mr-2" />
            About Meditime
          </div>
          <h2 className="text-4xl font-bold text-blue-800 mb-4">
            Transforming Healthcare, One Connection at a Time
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our mission is to make quality healthcare accessible, efficient, and
            patient-centered through innovative technology and compassionate
            service.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-blue-50 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Our Story</h3>
            <p className="text-gray-700">
              Founded by healthcare professionals and technology experts,
              Meditime bridges the gap between patients and providers through
              seamless digital experiences.
            </p>
            <p className="text-gray-700">
              Traditional systems often bring long waits and communication
              gaps. Meditime fixes that with simplicity, speed, and care.
            </p>
            <p className="text-gray-700">
              Today, thousands trust Meditime to connect patients and providers
              with ease and empathy.
            </p>

            {/* Achievements */}
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Key Achievements
              </h4>
              <ul className="grid grid-cols-2 gap-3">
                {achievements.map((text, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Image & Highlights */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-10 h-full flex flex-col items-center justify-center text-center shadow-lg">
              <div className="bg-white p-6 rounded-full shadow mb-6">
                <Heart className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Healthcare Excellence
              </h4>
              <p className="text-gray-600">Connecting hearts, minds & care</p>

              {/* Decorative icons */}
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-full shadow">
                <Award className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-teal-500 text-white p-3 rounded-full shadow">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These values guide every decision, from tech innovation to patient
            care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {values.map((val, i) => {
            const Icon = val.icon;
            return (
              <div key={i} className="text-center">
                <div
                  className={`inline-flex p-4 rounded-xl mb-4 transition-transform transform hover:scale-105 ${getColorClasses(
                    val.color
                  )}`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {val.title}
                </h4>
                <p className="text-gray-600 text-sm">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
          <p className="text-lg mb-10">
            Revolutionizing healthcare by connecting patients and providers
            digitally — fast, secure, and compassionate.
          </p>
          <div className="flex justify-center space-x-12 text-lg font-semibold">
            <div>
              <div className="text-2xl">24/7</div>
              <div className="text-sm opacity-90">Available</div>
            </div>
            <div>
              <div className="text-2xl">100%</div>
              <div className="text-sm opacity-90">Secure</div>
            </div>
            <div>
              <div className="text-2xl">∞</div>
              <div className="text-sm opacity-90">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
