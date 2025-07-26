import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const appointmentApi = createApi({
    reducerPath: "appointmentApi",
    baseQuery: fetchBaseQuery({
        baseUrl:  import.meta.env.VITE_BACKEND_URL,
        prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Appointments', 'Patients'],
    endpoints: (builder) => ({
        getAllAppointments: builder.query({
            query: ({ page, pageSize }) => ({
                url: 'appointments',
                params: { page, pageSize },
            }),
            providesTags: ['Appointments']
        }),

        getAppointmentsByUserId: builder.query({
            query: ({ userId, page, PageSize }) => ({
                url: 'appointments/user',
                params: { userId,page, PageSize  },
            }),
            providesTags: ['Appointments']
        }),

        getAppointmentsByDoctorId: builder.query({
            query: ({ doctorId }) => ({
                url: 'appointments/doctor',
                params: { doctorId },
            }),
            providesTags: ['Appointments']
        }),

        createAppointment: builder.mutation({
            query: (appointmentPayload) => ({
                url: 'appointments',
                method: 'POST',
                body: appointmentPayload
            }),
            invalidatesTags: ['Appointments']
        }),

        changeAppointmentStatus: builder.mutation({
            query: ({ appointmentId, status }) => ({
                url: `/appointments/${appointmentId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Appointments"],
        }),

        rescheduleAppointment: builder.mutation({
            query: ({ appointmentId, date }) => ({
                url: `/appointments/${appointmentId}/reschedule`,
                method: "PATCH",
                body: { date },
            }),
            invalidatesTags: ["Appointments"],
        }),

        doctorPatients: builder.query({
            query: ({ doctorId }) => ({
                url: 'patients/doctor',
                params: { doctorId },
            }),
            providesTags: ['Patients']
        }),

        getAppointmentsForDoctorAndDate: builder.query({
            query: ({ doctorId, appointmentDate }) =>
                `/appointments?doctorId=${doctorId}&date=${appointmentDate}`,
            providesTags: ['Appointments'],
        }),

    })

})