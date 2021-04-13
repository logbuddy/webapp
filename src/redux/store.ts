import { createStore, applyMiddleware, compose } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import Cookies from 'universal-cookie';
import root, { ReduxState, ValidAction } from './reducers/root';
import { initialState as sessionInitialState } from './reducers/session';
import { initialState as serversInitialState } from './reducers/servers';
import { initialState as activeServerInitialState } from './reducers/activeServer';

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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

const preloadedState: ReduxState = {
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

export default function configureStore() {
    return createStore<any, any, ReduxState, any> (
        root,
        preloadedState,
        composeEnhancers(applyMiddleware(thunk)),
    );
}

export interface ConnectedComponentProps {
    readonly reduxState: ReduxState,
    readonly dispatch: ThunkDispatch<ReduxState, void, ValidAction>
}
