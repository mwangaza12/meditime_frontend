import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { userApi } from "../feature/api/userApi";
import storage from "redux-persist/lib/storage";
import authReducer from "../feature/auth/authSlice";
import { appointmentApi } from "../feature/api/appointmentApi";
import { doctorApi } from "../feature/api/doctorApi";
import { complaintApi } from "../feature/api/complaintApi";
import { prescriptionApi } from "../feature/api/prescriptionApi";
import { specializationApi } from "../feature/api/specializationApi";
import { doctorAvailabilityApi } from "../feature/api/doctorAvailabilityApi";
import { paymentApi } from "../feature/api/paymentApi";

// create a persist config for the auth Slice
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','userType']
}

//create a persist reducer for the auth slice
const persistentAuthReducer = persistReducer(authPersistConfig,authReducer);

export const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        [appointmentApi.reducerPath]: appointmentApi.reducer,
        [doctorApi.reducerPath]: doctorApi.reducer,
        [complaintApi.reducerPath]: complaintApi.reducer,
        [prescriptionApi.reducerPath]: prescriptionApi.reducer,
        [specializationApi.reducerPath]: specializationApi.reducer,
        [doctorAvailabilityApi.reducerPath]: doctorAvailabilityApi.reducer,
        [paymentApi.reducerPath] : paymentApi.reducer,
        //use the Persistent reducer
        auth: persistentAuthReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(userApi.middleware, appointmentApi.middleware, doctorApi.middleware, complaintApi.middleware, prescriptionApi.middleware, specializationApi.middleware, doctorAvailabilityApi.middleware, paymentApi.middleware)
})

// export the persisted store
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;