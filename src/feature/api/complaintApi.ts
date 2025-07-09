import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const complaintApi = createApi({
    reducerPath: 'complaintApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api/',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Complaints'],

    endpoints: (builder) => ({
        getAllComplaints: builder.query({
            query: ({ page, pageSize }) => ({
                url: 'complaints',
                params: { page, pageSize },
            }),
            providesTags: ['Complaints']
        }),

        createComplaint: builder.mutation({
            query: (complaintPayload) => ({
                url: 'complaints',
                method: 'POST',
                body: complaintPayload
            }),
            invalidatesTags: ['Complaints']
        }),

        getUserComplaints: builder.query({
            query: (userId: number) => ({
                url: `/complaints/user/${userId}`, 
                method: "GET",
            }),
        }),
    })
})