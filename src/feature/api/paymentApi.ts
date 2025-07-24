import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const paymentApi = createApi({
    reducerPath: "paymentApi",
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
    tagTypes: ['Payments'],
    endpoints: (builder) => ({
        getAllPayments: builder.query({
            query: ({ page, pageSize }) => ({
                url: 'payments',
                params: { page, pageSize },
            }),
            providesTags: ['Payments']
        }),

        getPaymentsByUserId: builder.query({
            query: ({ userId }) => ({
                url: 'payments/user',
                params: { userId },
            }),
            providesTags: ['Payments']
        }),

        getPaymentsByDoctorId: builder.query({
            query: ({ doctorId }) => ({
                url: 'payments/doctor',
                params: { doctorId },
            }),
            providesTags: ['Payments']
        }),

        createPaymentSession: builder.mutation({
            query: (paymentPayload) => ({
                url: 'payments/create-checkout-session',
                method: 'POST',
                body: paymentPayload
            }),
            invalidatesTags: ['Payments']
        })

    })

})