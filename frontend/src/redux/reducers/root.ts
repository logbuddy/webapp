import { AnyAction, combineReducers } from 'redux';
import session, { sessionSlice, TSessionAction, ISessionState } from './session';
import servers, { TServersAction, IServersState } from './servers';
import activeServer, { TActiveServerAction, IActiveServerState } from './activeServer';

export default combineReducers({
    session: sessionSlice,
    servers,
    activeServer
});

export interface IBasicAction extends AnyAction {
    readonly type: string
}

export interface IErrorAction extends IBasicAction {
    readonly errorMessage: string
}

export interface IOperation {
    readonly isRunning: boolean,
    readonly justFinishedSuccessfully: boolean,
    readonly errorMessage: null | string
}

export interface IReduxState {
    readonly session: ISessionState,
    readonly servers: IServersState,
    readonly activeServer: IActiveServerState
}

export type TValidAction = TSessionAction | TServersAction | TActiveServerAction;
