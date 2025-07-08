import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const doctorApi = createApi({
    reducerPath: 'doctorApi',
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
    tagTypes: ['Doctors'],
    endpoints: (builder) => ({
        getAllDoctors: builder.query({
            query: ({ page, pageSize }) => ({
                url: 'doctors',
                params: { page, pageSize },
            }),
            providesTags: ['Doctors']
        })
    })

})