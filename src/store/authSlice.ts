import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '@/lib/api';

export interface User {
    id: number;
    username: string;
    email: string | null;
    email_verified: boolean;
    role: 'user' | 'admin' | 'editor';
    created_at: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    init: boolean;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    init: false,
};

export const login = createAsyncThunk(
    'auth/login',
    async (body: { login_id: string; password: string }, {rejectWithValue}) => {
        try {
            const {data} = await api.post('/auth/login', body);
            if (!data.success) throw new Error(data.error.message);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.error?.message || err.message || '登录失败'
            );
        }
    }
);

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, {rejectWithValue}) => {
        try {
            const {data} = await api.get('/user/profile');
            if (!data.success) throw new Error(data.error.message);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.error?.message || err.message || '获取用户信息失败'
            );
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (
        body: { username: string; password: string; email?: string },
        {rejectWithValue}
    ) => {
        try {
            const {data} = await api.post('/auth/register', body);
            if (!data.success) throw new Error(data.error.message);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.error?.message || err.message || '注册失败'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.init = true;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.init = true;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.init = true;
                state.user = action.payload.user;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.loading = false;
                state.init = true;
                state.user = null;
                state.token = null;
                localStorage.removeItem('token');
            });
    },
});

export const {logout, clearError} = authSlice.actions;
export default authSlice.reducer;
