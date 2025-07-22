// types.ts
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
}