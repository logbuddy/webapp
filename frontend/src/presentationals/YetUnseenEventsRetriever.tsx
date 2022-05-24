import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { IReduxState } from '../redux/slices/root';
import { startRepeatedlyRetrievingYetUnseenEventsCommand } from '../redux/slices/activeServerSlice';

const YetUnseenEventsRetriever = () => {
    const reduxState = useSelector((state: IReduxState) => state);
    const reduxDispatch = useDispatch();

    useEffect(() => {
        if (reduxState.activeServer.pollForYetUnseenEvents) {
            reduxDispatch(startRepeatedlyRetrievingYetUnseenEventsCommand());
        }
    }, [reduxDispatch, reduxState.activeServer.pollForYetUnseenEvents]);

    return <></>;
};

export default YetUnseenEventsRetriever;
