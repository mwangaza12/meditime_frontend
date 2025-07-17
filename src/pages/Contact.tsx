import React from 'react';
import { Mail, MapPin, Clock, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Contact: React.FC = () => {
  const contactDetails = [
    { icon: <Mail className="w-5 h-5" />, label: 'hello@company.com', href: 'mailto:hello@company.com' },
    { icon: <MapPin className="w-5 h-5" />, label: '123 Business St, New York', href: 'https://maps.google.com' },
    { icon: <Clock className="w-5 h-5" />, label: 'Mon–Fri: 9am – 6pm', href: null },
  ];

  const services = ['General Inquiry', 'Technical Support', 'Sales', 'Other'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-800 mb-2">Send Us a Message</h2>
                <p className="text-gray-500">We'd love to hear from you! Fill out the form below and our team will get back to you shortly.</p>
              </div>

              <form className="space-y-5">

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select a service</option>
                  {services.map(service => (
                    <option key={service}>{service}</option>
                  ))}
                </select>

                <textarea
                  rows={4}
                  placeholder="Message"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" /> Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold text-blue-800 mb-2">Contact Information</h2>
                <p className="text-gray-500 max-w-md">Our team is here to help. Reach out to us through the methods below or visit us in person.</p>
              </div>

              <div className="space-y-6">
                {contactDetails.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 text-gray-700">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                      {item.icon}
                    </div>
                    {item.href ? (
                      <a href={item.href} className="text-base hover:text-blue-700 transition">{item.label}</a>
                    ) : (
                      <span className="text-base">{item.label}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  title="Company Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.780260498762!2d-74.00601518459486!3d40.71277577933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjAuMCJX!5e0!3m2!1sen!2sus!4v1624374568254!5m2!1sen!2sus"
                  className="w-full h-56"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
