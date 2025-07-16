export const Content = () => {
  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="grid gap-5 row-gap-10 lg:grid-cols-2 items-center">
        {/* Text Content */}
        <div className="flex flex-col justify-center">
          <div className="max-w-xl mb-6">
            <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight text-blue-800 sm:text-4xl sm:leading-none">
              Seamless medical booking
              <br className="hidden md:block" />
              for{' '}
              <span className="relative px-1">
                <span className="absolute inset-x-0 bottom-0 h-3 transform -skew-x-12 bg-blue-100" />
                <span className="relative inline-block text-blue-800">
                  every patient
                </span>
              </span>
            </h2>
            <p className="text-base text-gray-700 md:text-lg">
              Book appointments with trusted healthcare professionals in just a few clicks.
              We simplify your healthcare journey—secure, fast, and patient-friendly.
            </p>
          </div>
          <p className="mb-4 text-sm font-bold tracking-widest uppercase text-blue-800">
            Key Features
          </p>
          <div className="grid space-y-3 sm:gap-2 sm:grid-cols-2 sm:space-y-0">
            <ul className="space-y-3">
              {['Instant Booking', 'Verified Doctors', 'Secure Records'].map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">
                    <svg
                      className="w-5 h-5 mt-px text-blue-800"
                      stroke="currentColor"
                      viewBox="0 0 52 52"
                    >
                      <polygon
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        points="29 13 14 29 25 29 23 39 38 23 27 23"
                      />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {['24/7 Availability', 'Smart Reminders', 'Telehealth Support'].map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">
                    <svg
                      className="w-5 h-5 mt-px text-blue-800"
                      stroke="currentColor"
                      viewBox="0 0 52 52"
                    >
                      <polygon
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        points="29 13 14 29 25 29 23 39 38 23 27 23"
                      />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Image Section */}
        <div>
          <img
            className="object-cover w-full h-56 rounded shadow-lg sm:h-96"
            src="https://images.pexels.com/photos/7580920/pexels-photo-7580920.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt="Medical Appointment Booking"
          />
        </div>
      </div>
    </div>
  );
};
