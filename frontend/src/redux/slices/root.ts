import { AnyAction } from 'redux';
import { ISessionState } from './sessionSlice';
import { TActiveServerAction, IActiveServerState } from './activeServer';
import { IServersState } from './serversSlice';

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

export type TValidAction = TActiveServerAction;
