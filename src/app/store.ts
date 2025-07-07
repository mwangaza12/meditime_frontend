import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { userApi } from "../feature/api/userApi";
import storage from "redux-persist/lib/storage";
import authReducer from "../feature/auth/authSlice";

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
        //use the Persistent reducer
        auth: persistentAuthReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(userApi.middleware)
})

// export the persisted store
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;