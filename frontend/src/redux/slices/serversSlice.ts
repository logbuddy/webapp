import { apiFetch } from '../util';
import { IOperation, IReduxState } from './root';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logOutOfAccountCommand } from './sessionSlice';

export interface IServerEvent {
    readonly id: string,
    readonly serverId: string,
    readonly userId: string,
    readonly receivedAt: number,
    readonly sortValue: string,
    readonly createdAt: string,
    readonly createdAtUtc: string,
    readonly source: string,
    readonly payload: string,
}

export interface IServer {
    readonly id: string,
    readonly type: string,
    readonly title: string,
    readonly userId: string,
    readonly apiKeyId: string,
    readonly events: Array<IServerEvent>,
    readonly structuredDataExplorerEvents: Array<IServerEvent>,
    readonly latestEventSortValue: null | string,
    readonly numberOfEventsPerHour: Array<number>
}

export interface IServersState {
    readonly showEventPayload: boolean,
    readonly retrieveServersOperation: IOperation,
    readonly createServerOperation: IOperation,
    readonly servers: Array<IServer>
}

export const initialState: IServersState = {
    showEventPayload: true,
    retrieveServersOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    createServerOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    servers: []
};


export const retrieveServersCommand = createAsyncThunk<Array<IServer>, void, { state: IReduxState, rejectValue: string }>(
    'servers/retrieveServers',
    async (arg, thunkAPI) => {
        return await apiFetch('/servers/', 'GET', thunkAPI.getState().session.webappApiKeyId)
            .then(response => {
                console.debug(response);
                if (response.status === 200) {
                    return response.json();
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


export const createServerCommand = createAsyncThunk<IServer, { title: string }, { state: IReduxState, rejectValue: string }>(
    'servers/createServer',
    async (arg, thunkAPI) => {
        return await apiFetch('/servers/', 'POST', thunkAPI.getState().session.webappApiKeyId, JSON.stringify({ title: arg.title }))
            .then(response => {
                console.debug(response);
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .then(parsedResponseContent => {
                return parsedResponseContent;
            })

            .catch(function (error) {
                console.error(error);
                return thunkAPI.rejectWithValue(error.message);
            });
    }
);

export const serversSlice = createSlice({
    name: 'servers',
    initialState,
    reducers: {
    },
    extraReducers: (builder => {
        builder.addCase(retrieveServersCommand.pending, state => {
            state.retrieveServersOperation.justFinishedSuccessfully = false;
            state.retrieveServersOperation.isRunning = true;
            state.retrieveServersOperation.errorMessage = null;
        });

        builder.addCase(retrieveServersCommand.rejected, (state, action) => {
            state.retrieveServersOperation.justFinishedSuccessfully = false;
            state.retrieveServersOperation.isRunning = false;
            state.retrieveServersOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(retrieveServersCommand.fulfilled, (state, action) => {
            state.retrieveServersOperation.justFinishedSuccessfully = true;
            state.retrieveServersOperation.isRunning = false;
            state.retrieveServersOperation.errorMessage = null;
            state.servers = action.payload;
        });


        builder.addCase(createServerCommand.pending, state => {
            state.createServerOperation.justFinishedSuccessfully = false;
            state.createServerOperation.isRunning = true;
            state.createServerOperation.errorMessage = null;
        });

        builder.addCase(createServerCommand.rejected, (state, action) => {
            state.createServerOperation.justFinishedSuccessfully = false;
            state.createServerOperation.isRunning = false;
            state.createServerOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(createServerCommand.fulfilled, (state, action) => {
            state.createServerOperation.justFinishedSuccessfully = true;
            state.createServerOperation.isRunning = false;
            state.createServerOperation.errorMessage = null;
            state.servers.push(action.payload);
        });


        builder.addCase(logOutOfAccountCommand.fulfilled, () => initialState);
    })
});
