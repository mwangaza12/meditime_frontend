import { createApi,fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export const userApi = createApi({
    reducerPath:'userApi',
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
    tagTypes: ['Users'],

    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (registerPayload) => ({
                url: 'auth/register',
                method: 'POST',
                body: registerPayload
            })
        }),

        loginUser: builder.mutation({
            query: (loginPayload) => ({
                url: 'auth/login',
                method: 'POST',
                body: loginPayload
            })
        }),

        getAllUsers: builder.query({
            query: ({ page, pageSize }) => `users?page=${page}&pageSize=${pageSize}`,
            providesTags: ["Users"],
        }),

        updateUser: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `users/${id}`,
                method: 'PUT',
                body,
            }),
        }),

        updateUserType: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `users/role/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Users']
        }),

        emailVerification: builder.mutation({
            query: (emailVerificationPayload) => ({
                url: 'auth/verify-email',
                method: 'PUT',
                body: emailVerificationPayload
            })
        }),

        getUserByUserId: builder.query({
            query:({userId})=>({
                url: `users/${userId}`,
                method: 'GET',
                providesTags: ["Users"],
            })
        }),

        changePassword: builder.mutation({
            query: ({ currentPassword, newPassword }) => ({
                url: "users/change-password",
                method: "POST",
                body: { currentPassword, newPassword },
            }),
        }),

        updateAvatar: builder.mutation({
            query: (file: File) => {
                const form = new FormData();
                form.append("avatar", file);
                return {
                url: "users/upload-profile-pic",
                method: "POST",
                body: form,
                };
            },
            invalidatesTags: ["Users"],
        }),
    })
})