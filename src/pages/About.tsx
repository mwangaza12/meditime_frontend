import { Heart, Shield, Users, Clock, Award, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

type ColorKey = 'red' | 'blue' | 'green' | 'purple';

export const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description: 'Every decision we make prioritizes patient well-being and quality care delivery.',
      color: 'red' as ColorKey
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'HIPAA-compliant platform ensuring your medical data is always protected.',
      color: 'blue' as ColorKey
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Making healthcare accessible to everyone, anywhere, at any time.',
      color: 'green' as ColorKey
    },
    {
      icon: Clock,
      title: 'Efficiency',
      description: 'Streamlining healthcare processes to save time for both patients and providers.',
      color: 'purple' as ColorKey
    }
  ];

  const achievements = [
    '75,000+ Patients Served',
    '1,500+ Healthcare Providers',
    '250,000+ Appointments Scheduled',
    '99.9% Platform Uptime',
    'HIPAA Compliant',
    '24/7 Support Available'
  ];

  const getColorClasses = (color: ColorKey): string => {
    const colorMap: Record<ColorKey, string> = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return colorMap[color] ?? colorMap.blue;
  };

    return (
        <div>
            <Navbar />
            <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Heart className="w-4 h-4 mr-2" />
                About Meditime
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transforming Healthcare, One Connection at a Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to make quality healthcare accessible, efficient, and patient-centered 
                through innovative technology and compassionate service.
            </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">

            {/* Left Content */}
            <div className="space-y-8">
                <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
                <div className="space-y-4 text-gray-600">
                    <p>
                    Founded by healthcare professionals and technology experts, Meditime was born from 
                    a simple yet powerful vision: to bridge the gap between patients and quality healthcare 
                    providers through seamless digital solutions.
                    </p>
                    <p>
                    We recognized that traditional healthcare systems often created barriers—long wait times, 
                    complicated scheduling, and fragmented communication. Our platform eliminates these 
                    obstacles, creating a streamlined experience that puts patients first.
                    </p>
                    <p>
                    Today, we're proud to serve thousands of patients and healthcare providers, facilitating 
                    meaningful connections that improve health outcomes and enhance the healthcare experience for everyone.
                    </p>
                </div>
                </div>

                {/* Achievements */}
                <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Achievements</h4>
                <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{achievement}</span>
                    </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Right Content - Image Placeholder */}
            <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white rounded-full p-6 shadow-lg mb-4 inline-block">
                    <Heart className="w-12 h-12 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Healthcare Excellence</h4>
                    <p className="text-gray-600">Connecting hearts, minds, and healthcare</p>
                </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                <Award className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-teal-500 text-white p-3 rounded-full shadow-lg">
                <Users className="w-6 h-6" />
                </div>
            </div>
            </div>

            {/* Core Values */}
            <div className="mb-16">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from product development to patient care
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                const Icon = value.icon;
                return (
                    <div key={index} className="text-center group">
                    <div className={`inline-flex p-4 rounded-lg ${getColorClasses(value.color)} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                    </div>
                );
                })}
            </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
                To revolutionize healthcare delivery by creating seamless connections between patients and 
                healthcare providers, ensuring everyone has access to quality care when and where they need it most.
            </p>
            <div className="flex justify-center space-x-8">
                <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Available</div>
                </div>
                <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-90">Secure</div>
                </div>
                <div className="text-center">
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm opacity-90">Possibilities</div>
                </div>
            </div>
            </div>
        </div>
        </section>

        <Footer />
        </div>
    );
};

