import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type { AvailabilityResponse } from "../../types/types";


export const doctorAvailabilityApi = createApi({
  reducerPath: "doctorAvailabilityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["DoctorAvailability"],
  endpoints: (builder) => ({

    // ✅ Get all availabilities (Admin use)
    getAllDoctorAvailability: builder.query<AvailabilityResponse, void>({
      query: () => ({
        url: "availability",
        method: "GET",
      }),
      providesTags: ["DoctorAvailability"],
    }),

    // ✅ Get availabilities by doctorId (Doctor use)
    getDoctorAvailabilityByDoctorId: builder.query<AvailabilityResponse, number>({
      query: (doctorId) => ({
        url: `availability/doctor/${doctorId}`,
        method: "GET",
      }),
      providesTags: ["DoctorAvailability"],
    }),

    // ✅ Create availability
    createDoctorAvailability: builder.mutation({
      query: (availabilityPayload) => ({
        url: "availability",
        method: "POST",
        body: availabilityPayload,
      }),
      invalidatesTags: ["DoctorAvailability"],
    }),

    // ✅ Delete availability by ID (optional)
    deleteDoctorAvailability: builder.mutation({
      query: (availabilityId: number) => ({
        url: `availability/${availabilityId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DoctorAvailability"],
    }),

    // ✅ Update availability (optional)
    updateDoctorAvailability: builder.mutation({
      query: ({ availabilityId, ...updatedData }) => ({
        url: `availability/${availabilityId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["DoctorAvailability"],
    }),
  }),
});

