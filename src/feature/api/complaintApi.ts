import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const complaintApi = createApi({
    reducerPath: 'complaintApi',
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
            providesTags: ['Complaints']
        }),

        getComplaintReplies: builder.query({
            query: (complaintId: number) => `complaints/${complaintId}/replies`,
            providesTags: ["Complaints"]
        }),

        addComplaintReply: builder.mutation({
            query: ({ complaintId, message }) => ({
                url: `complaints/${complaintId}/replies`,
                method: "POST",
                body: { message },
            }),
            invalidatesTags: ["Complaints"],
        }),

        changeComplaintStatus: builder.mutation({
            query: ({ complaintId, status }) => ({
                url: `/complaints/${complaintId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Complaints"],
        }),

        chatWithBot: builder.mutation({
            query: (message: string) => ({
                url: '/complaints/chatgpt',
                method: 'POST',
                body: { message },
            }),
        }),

    })
})