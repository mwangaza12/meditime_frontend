import { useState } from 'react';

const Item = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        aria-label="Toggle item"
        className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-lg font-medium text-gray-900">{title}</p>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            points="2,7 12,17 22,7"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4 pt-0 text-gray-700">{children}</div>}
    </div>
  );
};

export const Faq = () => {
  return (
    <section className="px-4 py-20 mx-auto max-w-7xl md:px-8">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold tracking-wider text-blue-800 uppercase rounded-full bg-blue-100">
          FAQs
        </span>
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-gray-600 text-md">
          Answers to common questions about booking appointments, security, and support.
        </p>
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        <Item title="How do I book an appointment with a doctor?">
          Simply sign in, navigate to the 'Book Appointment' section, choose your doctor and time slot, then confirm.
        </Item>
        <Item title="Is my personal data secure on Meditime?">
          Absolutely. We are fully HIPAA compliant and all data is encrypted end-to-end.
        </Item>
        <Item title="Can I cancel or reschedule appointments?">
          Yes. Go to your dashboard, view your appointment, and choose either 'Cancel' or 'Reschedule'.
        </Item>
        <Item title="What if I need help outside business hours?">
          Our 24/7 support team is always available via live chat or email.
        </Item>
      </div>
    </section>
  );
};

export default Faq;
