import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, configureStore } from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';
import { IReduxState } from './slices/root';
import { initialState as sessionInitialState, sessionSlice } from '../features/session/sessionSlice';
import { initialState as serversInitialState, serversSlice } from './slices/serversSlice';
import { initialState as activeServerInitialState, activeServerSlice } from './slices/activeServerSlice';

let preloadIsLoggedIn = sessionInitialState.isLoggedIn;
let preloadLoggedInEmail = sessionInitialState.loggedInEmail;
let preloadWebappApiKeyId = sessionInitialState.webappApiKeyId;

const cookies = new Cookies();
if (   cookies.getAll().hasOwnProperty('loggedInEmail')
    && cookies.getAll().hasOwnProperty('webappApiKeyId'))
{
    preloadIsLoggedIn = true;
    preloadLoggedInEmail = cookies.get('loggedInEmail');
    preloadWebappApiKeyId = cookies.get('webappApiKeyId');
}

const preloadedState: IReduxState = {
    session: {
        ...sessionInitialState,
        isLoggedIn: preloadIsLoggedIn,
        loggedInEmail: preloadLoggedInEmail,
        webappApiKeyId: preloadWebappApiKeyId
    },
    servers: serversInitialState,
    activeServer: activeServerInitialState
};

export const store = configureStore({
    reducer: {
        session: sessionSlice.reducer,
        servers: serversSlice.reducer,
        activeServer: activeServerSlice.reducer
    },
    preloadedState,
    devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface IConnectedComponentProps {
    readonly reduxState: IReduxState,
    readonly dispatch: ThunkDispatch<IReduxState, void, AnyAction>
}
