import React from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Footer } from '../components/Footer'

export const Contact: React.FC = () => {
  const contactDetails = [
    { icon: <Mail className="w-5 h-5" />, label: 'hello@company.com', href: 'mailto:hello@company.com' },
    { icon: <Phone className="w-5 h-5" />, label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: <MapPin className="w-5 h-5" />, label: '123 Business St, New York', href: 'https://maps.google.com' },
    { icon: <Clock className="w-5 h-5" />, label: 'Mon-Fri: 9am - 6pm', href: null }
  ]

  const services = ['General Inquiry', 'Technical Support', 'Sales', 'Other']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Get in Touch</h2>
            <p className="text-gray-600">We'd love to hear from you! Reach out with your questions, ideas, or just to say hello.</p>

            <form className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Select a service</option>
                {services.map(service => (
                  <option key={service}>{service}</option>
                ))}
              </select>

              <textarea
                rows={4}
                placeholder="Message"
                className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>

              <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center cursor-not-allowed opacity-60"
              >
                <Send className="w-5 h-5 mr-2" /> Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Contact Info</h2>
            <p className="text-gray-600">Our team is here to help you. Contact us using any of the methods below:</p>

            <div className="space-y-5">
              {contactDetails.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 text-gray-700">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a href={item.href} className="hover:text-blue-700 text-base">{item.label}</a>
                  ) : (
                    <span className="text-base">{item.label}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <iframe
                title="Company Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.780260498762!2d-74.00601518459486!3d40.71277577933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjAuMCJX!5e0!3m2!1sen!2sus!4v1624374568254!5m2!1sen!2sus"
                className="w-full h-48 rounded-xl border border-gray-300"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
