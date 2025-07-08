import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Lightbulb } from 'lucide-react';

export const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { value: "99.9%", label: "Accuracy" },
    { value: "10x", label: "Faster Insights" },
    { value: "2M+", label: "Lives Touched" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center text-gray-900">
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(100, 100, 100, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 100, 100, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center"> {/* Adjusted vertical padding */}
        {/* Pre-headline Badge */}
        <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-[#093FB4] to-blue-500 text-white text-xs px-3 py-1.5 rounded-full mb-4 md:mb-6 shadow-lg transform transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}> {/* Reduced size */}
          <Lightbulb className="w-3 h-3 mr-1" /> {/* Smaller icon */}
          <span>Innovation in Health Technology</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4 md:mb-6 text-gray-900 transform transition-all duration-1000 ease-out delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          The Future of <span className="inline-block bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">Healthcare</span> is Here.
        </h1>

        {/* Sub-headline */}
        <p className={`text-base md:text-lg text-gray-700 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed transform transition-all duration-1000 ease-out delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}> {/* Reduced max-width and text size */}
          Leveraging cutting-edge Automation and advanced analytics to deliver precise, personalized, and predictive health solutions for everyone.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row justify-center gap-3 md:gap-4 transform transition-all duration-1000 ease-out delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <button className="group relative flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ease-out
            bg-gradient-to-r from-[#093FB4] to-blue-700 hover:from-[#093FB4] hover:to-blue-800 hover:scale-105"> {/* Reduced padding and font size */}
            <span className="relative z-10 flex items-center">
              Explore Our Solutions
              <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> {/* Reduced icon size and translation */}
            </span>
          </button>
          <button className="group flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold text-gray-800 rounded-xl border border-gray-300 backdrop-blur-sm
            hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 ease-out hover:scale-105"> {/* Reduced padding and font size */}
            <ShieldCheck className="mr-1.5 w-3.5 h-3.5 text-green-600" /> {/* Reduced icon size */}
            <span>Learn About Our Security</span>
          </button>
        </div>

        {/* Key Metrics/Stats */}
        <div className={`mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 max-w-2xl mx-auto transform transition-all duration-1000 ease-out delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}> {/* Adjusted gaps and top margin */}
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#093FB4] to-blue-500 bg-clip-text text-transparent mb-0.5`}> {/* Reduced font sizes */}
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-medium text-gray-700">{stat.label}</div> {/* Reduced font sizes */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}