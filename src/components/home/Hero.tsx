import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Lightbulb } from "lucide-react";
import heroImg from "../../assets/hero.jpg";

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
    <div className="relative flex flex-col-reverse lg:flex-row py-16 lg:pt-0 lg:pb-0 bg-gray-50">
      {/* Image Section */}
      <div className="inset-y-0 top-0 right-0 z-0 w-full max-w-xl px-4 mx-auto md:px-0 lg:pr-0 lg:mb-0 lg:mx-0 lg:w-7/12 lg:max-w-full lg:absolute xl:px-0">
        <svg
          className="absolute left-0 hidden h-full text-white transform -translate-x-1/2 lg:block"
          viewBox="0 0 100 100"
          fill="currentColor"
          preserveAspectRatio="none slice"
        >
          <path d="M50 0H100L50 100H0L50 0Z" />
        </svg>
        <img
          className="object-cover w-full h-56 rounded shadow-lg lg:rounded-none lg:shadow-none md:h-96 lg:h-full"
          src={heroImg}
          alt="Healthcare Innovation"
        />
      </div>

      {/* Text Section */}
      <div className="relative flex flex-col items-start w-full max-w-xl px-4 mx-auto md:px-0 lg:px-8 lg:max-w-screen-xl">
        <div className="mb-16 lg:my-40 lg:max-w-lg lg:pr-5">
          <div className={`inline-flex items-center space-x-2 bg-blue-800 text-white text-xs px-3 py-1.5 rounded-full mb-4 shadow-lg transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Lightbulb className="w-4 h-4 mr-1" />
            <span>Innovation in Health Technology</span>
          </div>

          <h1 className={`text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5 transition-all duration-1000 ease-out delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            The Future of <span className="text-blue-800">Healthcare</span> is Here.
          </h1>

          <p className={`text-base md:text-lg text-gray-700 mb-6 transition-all duration-1000 ease-out delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            Leveraging automation and advanced analytics to deliver precise, personalized, and predictive health solutions for everyone.
          </p>

          {/* Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 ease-out delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 text-white bg-blue-800 hover:bg-blue-900 font-semibold rounded-xl transition-all duration-300"
            >
              Explore Our Solutions
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 text-blue-800 border border-blue-800 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
            >
              <ShieldCheck className="mr-2 w-4 h-4 text-green-600" />
              Learn About Our Security
            </a>
          </div>

          {/* Stats */}
          <div className={`mt-10 flex flex-wrap gap-6 transition-all duration-1000 ease-out delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-start">
                <p className="text-2xl font-extrabold text-blue-800">{stat.value}</p>
                <p className="text-sm text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
