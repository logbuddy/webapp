import { compose } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';
import {IReduxState, reducer, TValidAction} from './reducers/root';
import {initialState as sessionInitialState, sessionSlice} from './reducers/session';
import { initialState as serversInitialState } from './reducers/servers';
import { initialState as activeServerInitialState } from './reducers/activeServer';

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
    // @ts-ignore
    activeServer: activeServerInitialState
};

// export default function configureStore() {
//     return createStore<any, any, IReduxState, any> (
//         root,
//         preloadedState,
//         composeEnhancers(applyMiddleware(thunk)),
//     );
// }

export const store = configureStore({
    reducer: {
        session: sessionSlice.reducer
    },
    preloadedState,
    devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface IConnectedComponentProps {
    readonly reduxState: IReduxState,
    readonly dispatch: ThunkDispatch<IReduxState, void, TValidAction>
}
