import { ISessionState } from './sessionSlice';
import { IActiveServerState } from './activeServerSlice';
import { IServersState } from './serversSlice';

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
