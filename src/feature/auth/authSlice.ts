import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    user: null | any;
    token: string | null;
    isAuthenticated: boolean;
    userType: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    userType: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string, userType:any }>) => {
            state.user = action.payload;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.userType = action.payload.userType;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;