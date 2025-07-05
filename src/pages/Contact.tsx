import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Footer } from '../components/Footer'

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  service: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    service: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loading, setLoading] = useState(false)

  const contactDetails = [
    { icon: <Mail className="w-5 h-5" />, label: 'hello@company.com', href: 'mailto:hello@company.com' },
    { icon: <Phone className="w-5 h-5" />, label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: <MapPin className="w-5 h-5" />, label: '123 Business St, New York', href: 'https://maps.google.com' },
    { icon: <Clock className="w-5 h-5" />, label: 'Mon-Fri: 9am - 6pm', href: null }
  ]

  const services = ['General Inquiry', 'Technical Support', 'Sales', 'Other']

  const validate = () => {
    const errs: FormErrors = {}
    if (!formData.name.trim()) errs.name = 'Required'
    if (!formData.email.trim()) errs.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid'
    if (!formData.message.trim()) errs.message = 'Required'
    return errs
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async () => {
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setLoading(true)
    setStatus('idle')
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', service: '' })
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">

        <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>

            {status === 'success' && (
              <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg text-sm">
                <CheckCircle className="w-5 h-5 mr-2" /> Message sent successfully.
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center text-red-700 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 mr-2" /> Something went wrong. Try again.
              </div>
            )}

            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}

            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}

            <input
              type="text"
              name="phone"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />

            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="">Select a service</option>
              {services.map(s => <option key={s}>{s}</option>)}
            </select>

            <textarea
              name="message"
              placeholder="Message *"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 resize-none ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.message && <div className="text-red-500 text-sm">{errors.message}</div>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Contact Info</h2>
            {contactDetails.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 text-gray-600">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{item.icon}</div>
                {item.href ? (
                  <a href={item.href} className="hover:text-blue-700">{item.label}</a>
                ) : (
                  <span>{item.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
