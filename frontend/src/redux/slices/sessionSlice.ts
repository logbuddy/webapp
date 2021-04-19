import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../util';
import { IOperation } from './root';

export interface ISessionState {
    readonly isLoggedIn: boolean,
    readonly loggedInEmail: null | string,
    readonly webappApiKeyId: null | string,
    readonly registrationOperation: IOperation,
    readonly loginOperation: IOperation
}

export const initialState: ISessionState = {
    isLoggedIn: false,
    loggedInEmail: null,
    webappApiKeyId: null,
    registrationOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    loginOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    }
};


export const registerAccountCommand = createAsyncThunk<void, { email: string, password: string }, { rejectValue: string }>(
    'session/registerAccount',
    async (arg, thunkAPI) => {
        return await apiFetch('/users/', 'POST', null, JSON.stringify({ email: arg.email, password: arg.password }))
            .then(response => {
                console.debug(response);
                if (response.status === 201) {
                    return;
                } else if (response.status === 400) {
                    throw new Error(`User ${arg.email} already exists.`);
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .catch(function (error) {
                console.error(error);
                return thunkAPI.rejectWithValue(error.message);
            });
    }
);


export const logIntoAccountCommand = createAsyncThunk<{ webAppApiKeyId: string, email: string }, { email: string, password: string }, { rejectValue: string }>(
    'session/logIntoAccount',
    async (arg, thunkAPI) => {

        const result = await apiFetch('/webapp-api-keys/', 'POST', null, JSON.stringify({ email: arg.email, password: arg.password }))
            .then(response => {
                console.debug(response);
                if (response.status === 201) {
                    return response.json();
                } else if (response.status === 404) {
                    throw new Error(`User ${arg.email} not found.`);
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .then(parsedResponseContent => {
                document.cookie = `loggedInEmail=${arg.email};path=/`;
                document.cookie = `webappApiKeyId=${parsedResponseContent};path=/`;
                return parsedResponseContent;
            })

            .catch(function (error: Error) {
                console.error(error);
                return thunkAPI.rejectWithValue(error.message);
            });

        return { webAppApiKeyId: result, email: arg.email };
    }
);


export const logOutOfAccountCommand = createAsyncThunk(
    'session/logOutOfAccount',
    async () => {
        document.cookie = `loggedInEmail=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
        document.cookie = `webappApiKeyId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
        return;
    }
);


export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
    },
    extraReducers: (builder => {
        builder.addCase(registerAccountCommand.pending, state => {
            state.registrationOperation.justFinishedSuccessfully = false;
            state.registrationOperation.isRunning = true;
            state.registrationOperation.errorMessage = null;
        });

        builder.addCase(registerAccountCommand.rejected, (state, action) => {
            state.registrationOperation.justFinishedSuccessfully = false;
            state.registrationOperation.isRunning = false;
            state.registrationOperation.errorMessage = action.payload ?? 'Unknown error';
        });

        builder.addCase(registerAccountCommand.fulfilled, state => {
            state.registrationOperation.justFinishedSuccessfully = true;
            state.registrationOperation.isRunning = false;
            state.registrationOperation.errorMessage = null;
        });


        builder.addCase(logIntoAccountCommand.pending, state => {
            state.isLoggedIn = false;
            state.loginOperation.justFinishedSuccessfully = false;
            state.loginOperation.isRunning = true;
            state.loginOperation.errorMessage = null;
        });

        builder.addCase(logIntoAccountCommand.rejected, (state, action) => {
            state.isLoggedIn = false;
            state.loginOperation.justFinishedSuccessfully = false;
            state.loginOperation.isRunning = false;
            state.loginOperation.errorMessage = action.payload ?? 'Unknown error';
        });

        builder.addCase(logIntoAccountCommand.fulfilled, (state, action) => {
            state.webappApiKeyId = action.payload.webAppApiKeyId;
            state.loggedInEmail = action.payload.email;
            state.isLoggedIn = true;
            state.loginOperation.justFinishedSuccessfully = true;
            state.loginOperation.isRunning = false;
            state.loginOperation.errorMessage = null;
        });


        builder.addCase(logOutOfAccountCommand.fulfilled, state => {
            state.webappApiKeyId = null;
            state.loggedInEmail = null;
            state.isLoggedIn = false;
        })
    })
});
