// @ts-ignore
import { DatetimeHelper } from 'herodot-webapp-shared';
import { IOperation, IReduxState } from './root';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logOutOfAccountCommand } from './sessionSlice';
import { IServer, IServerEvent } from './serversSlice';
import { apiFetch } from '../util';

export const LOG_EVENTS_PRESENTATION_MODE_DEFAULT = 0;
export const LOG_EVENTS_PRESENTATION_MODE_COMPACT = 1;

export type TLogEventsPresentationMode = 0 | 1;

export interface IStructuredDataExplorerAttribute {
    readonly byName: string,
    readonly byVal: string
}

export interface IActiveServerState {
    readonly server: null | IServer,
    readonly logEventsPresentationMode: TLogEventsPresentationMode,
    readonly pollForYetUnseenEvents: boolean,
    readonly showEventPayload: boolean,
    readonly showStructuredDataExplorerAttributes: boolean,
    readonly informationPanelIsOpen: boolean,
    readonly examplePanelIsOpen: boolean,
    readonly currentEventsResultPage: number,
    readonly retrieveEventsOperation: IOperation,
    readonly retrieveYetUnseenEventsOperation: IOperation,
    readonly retrieveNumberOfEventsPerHourOperation: IOperation,
    readonly retrieveStructuredDataExplorerEventsOperation: IOperation,
    readonly eventLoadedInStructuredDataExplorer: null | IServerEvent,
    readonly activeStructuredDataExplorerAttributes: Array<IStructuredDataExplorerAttribute>,
    readonly selectedTimelineIntervalStart: Date,
    readonly selectedTimelineIntervalEnd: Date,
    readonly timelineIntervalStart: Date,
    readonly timelineIntervalEnd: Date
}

export const initialState: IActiveServerState = {
    server: null,
    logEventsPresentationMode: LOG_EVENTS_PRESENTATION_MODE_DEFAULT,
    pollForYetUnseenEvents: true,
    showEventPayload: true,
    showStructuredDataExplorerAttributes: true,
    informationPanelIsOpen: false,
    examplePanelIsOpen: false,
    currentEventsResultPage: 1,
    retrieveEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveYetUnseenEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveNumberOfEventsPerHourOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveStructuredDataExplorerEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    eventLoadedInStructuredDataExplorer: null,
    activeStructuredDataExplorerAttributes: [],
    selectedTimelineIntervalStart: DatetimeHelper.timelineConfig.selectedTimelineIntervalStart,
    selectedTimelineIntervalEnd: DatetimeHelper.timelineConfig.selectedTimelineIntervalEnd,
    timelineIntervalStart: DatetimeHelper.timelineConfig.timelineIntervalStart,
    timelineIntervalEnd: DatetimeHelper.timelineConfig.timelineIntervalEnd,
};


export const retrieveEventsCommand = createAsyncThunk<Array<IServerEvent>, void, { state: IReduxState, rejectValue: string }>(
    'activeServer/retrieveEvents',
    async (arg, thunkAPI) => {
        const server = thunkAPI.getState().activeServer.server ?? null;

        if (server === null) {
            return;
        }

        const queryParams: any = {
            serverId: server.id,
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalEnd)
        };

        const result = await apiFetch(
            '/servers/events/',
            'GET',
            thunkAPI.getState().session.webappApiKeyId,
            null,
            queryParams
        )
            .then(response => {
                console.debug(response);
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .catch(function(error) {
                console.error(error)
                return thunkAPI.rejectWithValue(error.message);
            });

        thunkAPI.dispatch(retrieveYetUnseenEventsCommand());

        return result;
    }
);


export const retrieveNumberOfEventsPerHourCommand = createAsyncThunk<Array<number>, void, { state: IReduxState, rejectValue: string }>(
    'activeServer/retrieveNumberOfEventsPerHour',
    async (arg, thunkAPI) => {
        const server = thunkAPI.getState().activeServer.server ?? null;

        if (server === null) {
            return;
        }

        const queryParams: any = {
            serverId: server.id,
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalEnd)
        };

        return await apiFetch(
            '/servers/number-of-events-per-hour',
            'GET',
            thunkAPI.getState().session.webappApiKeyId,
            null,
            queryParams
        )
            .then(response => {
                console.debug(response);
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .catch(function(error) {
                console.error(error)
                return thunkAPI.rejectWithValue(error.message);
            });
    }
);


export const retrieveYetUnseenEventsCommand = createAsyncThunk<Array<IServerEvent>, void, { state: IReduxState, rejectValue: string }>(
    'activeServer/retrieveYetUnseenEvents',
    async (arg, thunkAPI) => {
        const repeat = () => {
            if (thunkAPI.getState().activeServer.server !== null) {
                setTimeout(
                    () => {
                        thunkAPI.dispatch(retrieveYetUnseenEventsCommand());
                    },
                    2000
                );
            }
        }

        const server = thunkAPI.getState().activeServer.server ?? null;

        if (server === null) {
            return thunkAPI.rejectWithValue('server is null.');
        }

        if (!thunkAPI.getState().activeServer.pollForYetUnseenEvents) {
            repeat();
            return thunkAPI.rejectWithValue('Polling disabled, skipping.');
        }

        const result = await apiFetch(
            `/servers/yet-unseen-events/`,
            'GET',
            thunkAPI.getState().session.webappApiKeyId,
            null,
            {
                serverId: server.id,
                latestSeenSortValue: server.latestEventSortValue ?? 'null',
                selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalStart),
                selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalEnd)
            }
        )
            .then(response => {
                console.debug(response);
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .catch(function(error) {
                console.error(error)
                return thunkAPI.rejectWithValue(error.message);
            });

        repeat();

        return result;
    }
);


export const retrieveStructuredDataExplorerEventsCommand = createAsyncThunk<Array<IServerEvent>, void, { state: IReduxState, rejectValue: string }>(
    'activeServer/retrieveStructuredDataExplorerEvents',
    async (arg, thunkAPI) => {
        const server = thunkAPI.getState().activeServer.server ?? null;

        if (server === null) {
            return;
        }

        if (thunkAPI.getState().activeServer.activeStructuredDataExplorerAttributes.length === 0) {
            console.error('Was asked to retrieve Structured Data Explorer events, but no attributes are set.');
            return;
        }

        const queryParams: any = {
            serverId: server.id,
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(thunkAPI.getState().activeServer.selectedTimelineIntervalEnd)
        };

        let i = 0;
        const attributes = thunkAPI.getState().activeServer.activeStructuredDataExplorerAttributes;
        for (let attribute of attributes) {
            queryParams[`byName[${i}]`] = attribute.byName;
            queryParams[`byVal[${i}]`] = attribute.byVal;
            i++;
        }

        return await apiFetch(
            '/servers/events-by/',
            'GET',
            thunkAPI.getState().session.webappApiKeyId,
            null,
            queryParams
        )
            .then(response => {
                console.debug(response);
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected response from server (code ${response.status}).`);
                }
            })

            .catch(function(error) {
                console.error(error)
                return thunkAPI.rejectWithValue(error.message);
            });
    }
);


export const activeServerSlice = createSlice({
    name: 'activeServer',
    initialState,

    reducers: {
        makeServerActiveCommand: (state, action: PayloadAction<IServer>) => {
            state.server = action.payload;
        },

        closeActiveServerCommand: () => initialState,

        cycleLogEventsPresentationModeCommand: state => {
            state.logEventsPresentationMode =
                state.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_COMPACT
                    ? LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                    : LOG_EVENTS_PRESENTATION_MODE_COMPACT;
        },

        switchInformationPanelCommand: state => {
            state.informationPanelIsOpen = !state.informationPanelIsOpen;
        },

        switchExamplePanelCommand: state => {
            state.examplePanelIsOpen = !state.examplePanelIsOpen;
        },

        switchShowEventPayloadCommand: state => {
            state.showEventPayload = !state.showEventPayload;
        },

        switchShowStructuredDataExplorerAttributesCommand: state => {
            state.showStructuredDataExplorerAttributes = !state.showStructuredDataExplorerAttributes;
        },

        switchPollForYetUnseenEventsCommand: state => {
            state.pollForYetUnseenEvents = !state.pollForYetUnseenEvents;
        },

        changeCurrentEventsResultPageCommand: (state, action: PayloadAction<number>) => {
            state.currentEventsResultPage = action.payload;
        },

        loadEventIntoStructuredDataExplorerCommand: (state, action: PayloadAction<IServerEvent>) => {
            state.eventLoadedInStructuredDataExplorer = action.payload;
        },

        closeStructuredDataExplorerCommand: state => {
            state.eventLoadedInStructuredDataExplorer = null;
        },

        selectActiveStructuredDataExplorerAttributeCommand: (state, action: PayloadAction<IStructuredDataExplorerAttribute>) => {
            state.activeStructuredDataExplorerAttributes = [action.payload];
        },

        addActiveStructuredDataExplorerAttributeCommand: (state, action: PayloadAction<IStructuredDataExplorerAttribute>) => {
            state.activeStructuredDataExplorerAttributes.push(action.payload);
        },

        removeActiveStructuredDataExplorerAttributeCommand: (state, action: PayloadAction<IStructuredDataExplorerAttribute>) => {
            const remainingAttributes = [];
            for (let attribute of state.activeStructuredDataExplorerAttributes) {
                if (!(attribute.byName === action.payload.byName && attribute.byVal === action.payload.byVal)) {
                    remainingAttributes.push(attribute);
                }
            }
            state.activeStructuredDataExplorerAttributes = remainingAttributes;
            if (remainingAttributes.length === 0) {
                if (state.server !== null) {
                    state.server.structuredDataExplorerEvents = [];
                }
            }
        },

        selectedTimelineIntervalsUpdatedEvent: (state, action: PayloadAction<{ selectedTimelineIntervalStart: Date, selectedTimelineIntervalEnd: Date }>) => {
            state.selectedTimelineIntervalStart = action.payload.selectedTimelineIntervalStart;
            state.selectedTimelineIntervalEnd = action.payload.selectedTimelineIntervalEnd;
        }
    },

    extraReducers: (builder => {
        builder.addCase(retrieveEventsCommand.pending, state => {
            state.retrieveEventsOperation.justFinishedSuccessfully = false;
            state.retrieveEventsOperation.isRunning= true;
            state.retrieveEventsOperation.errorMessage = null;
        });

        builder.addCase(retrieveEventsCommand.rejected, (state, action) => {
            state.retrieveEventsOperation.justFinishedSuccessfully = false;
            state.retrieveEventsOperation.isRunning= false;
            state.retrieveEventsOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(retrieveEventsCommand.fulfilled, (state, action) => {
            state.retrieveEventsOperation.justFinishedSuccessfully = true;
            state.retrieveEventsOperation.isRunning= false;
            state.retrieveEventsOperation.errorMessage = null;
            if (state.server !== null) {
                state.server.events = action.payload;
                state.server.latestEventSortValue = state.server.events[0].sortValue ?? null;
            }
        });


        builder.addCase(retrieveNumberOfEventsPerHourCommand.pending, state => {
            state.retrieveNumberOfEventsPerHourOperation.justFinishedSuccessfully = false;
            state.retrieveNumberOfEventsPerHourOperation.isRunning= true;
            state.retrieveNumberOfEventsPerHourOperation.errorMessage = null;
        });

        builder.addCase(retrieveNumberOfEventsPerHourCommand.rejected, (state, action) => {
            state.retrieveNumberOfEventsPerHourOperation.justFinishedSuccessfully = false;
            state.retrieveNumberOfEventsPerHourOperation.isRunning= false;
            state.retrieveNumberOfEventsPerHourOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(retrieveNumberOfEventsPerHourCommand.fulfilled, (state, action) => {
            state.retrieveNumberOfEventsPerHourOperation.justFinishedSuccessfully = true;
            state.retrieveNumberOfEventsPerHourOperation.isRunning= false;
            state.retrieveNumberOfEventsPerHourOperation.errorMessage = null;
            if (state.server !== null) {
                state.server.numberOfEventsPerHour = action.payload;
            }
        });


        builder.addCase(retrieveYetUnseenEventsCommand.pending, state => {
            state.retrieveYetUnseenEventsOperation.justFinishedSuccessfully = false;
            state.retrieveYetUnseenEventsOperation.isRunning= true;
            state.retrieveYetUnseenEventsOperation.errorMessage = null;
        });

        builder.addCase(retrieveYetUnseenEventsCommand.rejected, (state, action) => {
            state.retrieveYetUnseenEventsOperation.justFinishedSuccessfully = false;
            state.retrieveYetUnseenEventsOperation.isRunning= false;
            state.retrieveYetUnseenEventsOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(retrieveYetUnseenEventsCommand.fulfilled, (state, action) => {
            state.retrieveYetUnseenEventsOperation.justFinishedSuccessfully = true;
            state.retrieveYetUnseenEventsOperation.isRunning= false;
            state.retrieveYetUnseenEventsOperation.errorMessage = null;
            let latestEventSortValue = null;
            if (state.server !== null && action.payload.length > 0) {
                if (state.server.events.length > 0) {
                    latestEventSortValue = state.server.events[0].sortValue;
                }
                for (let event of action.payload) {
                    if (latestEventSortValue === null || event.sortValue > latestEventSortValue) {
                        state.server.events.unshift(event);
                        console.debug(event);
                    }
                }
                if (state.server.events.length > 0) {
                    state.server.latestEventSortValue = state.server.events[0].sortValue;
                }
            }
        });


        builder.addCase(retrieveStructuredDataExplorerEventsCommand.pending, state => {
            state.retrieveStructuredDataExplorerEventsOperation.justFinishedSuccessfully = false;
            state.retrieveStructuredDataExplorerEventsOperation.isRunning= true;
            state.retrieveStructuredDataExplorerEventsOperation.errorMessage = null;
        });

        builder.addCase(retrieveStructuredDataExplorerEventsCommand.rejected, (state, action) => {
            state.retrieveStructuredDataExplorerEventsOperation.justFinishedSuccessfully = false;
            state.retrieveStructuredDataExplorerEventsOperation.isRunning= false;
            state.retrieveStructuredDataExplorerEventsOperation.errorMessage = action.payload ?? 'Unknown error.';
        });

        builder.addCase(retrieveStructuredDataExplorerEventsCommand.fulfilled, (state, action) => {
            state.retrieveStructuredDataExplorerEventsOperation.justFinishedSuccessfully = true;
            state.retrieveStructuredDataExplorerEventsOperation.isRunning= false;
            state.retrieveStructuredDataExplorerEventsOperation.errorMessage = null;
            if (state.server !== null) {
                state.server.structuredDataExplorerEvents = action.payload;
            }
        });


        builder.addCase(logOutOfAccountCommand.fulfilled, () => initialState);
    })
});
