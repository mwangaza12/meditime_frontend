// types.ts
import { type ReactNode } from "react";

export interface DoctorUser {
    firstName: string;
    lastName: string;
}

export interface Doctor {
    user?: DoctorUser;
}

export interface Availability {
    availabilityId: number;
    doctorId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    doctor?: Doctor;
}

export interface AvailabilityResponse {
    availabilities: Availability[];
    total: number;
}

export type CalendarEvent = {
    original: any;
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
};

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  doctor: {
    profileImageUrl: string;
  }
  specialization?: string;
  date: string;
  startTime: string;
  status: "pending" | "cancelled" | "confirmed";
  durationMinutes: number;
  totalAmount?: number;
  isPaid?: boolean;
  startDateTime: string | null,
}

export interface Complaint {
  unreadCount: ReactNode;
  id: string;
  userName: string;
  appointmentDate: string;
  subject: string;
  complaintText: string;
  status: "open" | "inProgress" | "resolved" | "closed";
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  doctor: {
    profileImageUrl: string;
  }
  specialization?: string;
  date: string;
  startTime: string;
  status: "pending" | "cancelled" | "confirmed";
  durationMinutes: number;
  totalAmount?: number;
  isPaid?: boolean;
  startDateTime: string | null,
}

export type ForgotPasswordForm = {
  email: string;
};

export type UserLoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type UserRegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contactPhone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export type ComplaintForm = {
  userId: number;
  relatedAppointmentId: number;
  subject: string;
  description: string;
};

export interface ComplaintModalProps {
  appointmentId: string;
  onClose: () => void;
}