import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const prescriptionApi = createApi({
    reducerPath: 'prescriptionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),

    tagTypes: ['Prescriptions'],

    endpoints: builder => ({
        getAllPrescriptions: builder.query({
            query: ({ page, pageSize }) => ({
                url: 'prescriptions',
                params: { page, pageSize },
            }),
            providesTags: ['Prescriptions']
        }),

        getPrescriptionsByUserId: builder.query({
            query: ({ userId }) => ({
                url: 'prescriptions/user',
                params: { userId },
            }),
            providesTags: ['Prescriptions']
        }),

        getPrescriptionsByDoctorId: builder.query({
            query: ({ doctorId }) => ({
                url: 'prescriptions/doctor',
                params: { doctorId },
            }),
            providesTags: ['Prescriptions']
        }),

        createPrescription: builder.mutation({
            query: (prescriptionPayload) => ({
                url: 'prescriptions',
                method: 'POST',
                body: prescriptionPayload
            }),
            invalidatesTags: ['Prescriptions']
        })
    })
})