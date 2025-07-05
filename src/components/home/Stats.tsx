import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Award, Heart, Shield, TrendingUp, Star } from 'lucide-react';

type StatItem = {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  description: string;
  color: keyof typeof colorMap;
};

const colorMap = {
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  teal: 'bg-teal-100 text-teal-600 border-teal-200',
  green: 'bg-green-100 text-green-600 border-green-200',
  purple: 'bg-purple-100 text-purple-600 border-purple-200',
  red: 'bg-red-100 text-red-600 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
};

export const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  type CounterProps = {
    end: number;
    duration?: number;
    suffix?: string;
  };

  const Counter = ({ end, duration = 2000, suffix = '' }: CounterProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime: number;
      const startCount = 0;
      const endCount = end;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * (endCount - startCount) + startCount);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  const stats: StatItem[] = [
    {
      icon: Users,
      value: 75000,
      suffix: '+',
      label: 'Happy Patients',
      description: 'Trusted by thousands worldwide',
      color: 'blue',
    },
    {
      icon: Calendar,
      value: 250000,
      suffix: '+',
      label: 'Appointments Scheduled',
      description: 'Seamless booking experience',
      color: 'teal',
    },
    {
      icon: Clock,
      value: 99.9,
      suffix: '%',
      label: 'Uptime Reliability',
      description: 'Always available when you need us',
      color: 'green',
    },
    {
      icon: Award,
      value: 1500,
      suffix: '+',
      label: 'Healthcare Providers',
      description: 'Verified medical professionals',
      color: 'purple',
    },
    {
      icon: Heart,
      value: 98,
      suffix: '%',
      label: 'Patient Satisfaction',
      description: 'Exceptional care quality',
      color: 'red',
    },
    {
      icon: Shield,
      value: 100,
      suffix: '%',
      label: 'HIPAA Compliant',
      description: 'Your data is secure',
      color: 'indigo',
    },
  ];

  const getColorClasses = (color: keyof typeof colorMap): string => {
    return colorMap[color] || colorMap.blue;
  };

  return (
    <section id="stats-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trusted by Healthcare Professionals
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Numbers That Matter</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform continues to grow, connecting more patients with quality healthcare
            providers while maintaining the highest standards of service and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  isVisible ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      <Counter end={stat.value} suffix={stat.suffix} />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Healthcare Professionals Choose Meditime
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Advanced Security</p>
                    <p className="text-sm text-gray-600">
                      HIPAA-compliant platform with end-to-end encryption
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">24/7 Support</p>
                    <p className="text-sm text-gray-600">Round-the-clock technical and medical support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Seamless Integration</p>
                    <p className="text-sm text-gray-600">Easy integration with existing healthcare systems</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
                <p className="text-gray-600 mb-4">Average rating from healthcare providers</p>
                <blockquote className="text-sm text-gray-700 italic">
                  "Meditime has transformed how we manage patient appointments. The platform is intuitive, secure, and incredibly reliable."
                </blockquote>
                <div className="mt-3 text-xs text-gray-500">Dr. Sarah Johnson, Family Medicine</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
