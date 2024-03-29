import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
// @ts-ignore
import { DatetimeHelper } from 'herodot-webapp-shared';
import { IReduxState } from '../redux/slices/root';
import {
    activeServerSlice,
    retrieveEventsCommand,
    retrieveNumberOfEventsPerHourCommand,
    retrieveStructuredDataExplorerEventsCommand,
} from '../redux/slices/activeServerSlice';
import { Redirect } from 'react-router-dom';
import ServerTimelinePresentational from './ServerTimelinePresentational';
import { X } from 'react-bootstrap-icons';
import ServerInformationPanelContainer from '../containers/ServerInformationPanelContainer';
import ServerExamplePanelPresentational from './ServerExamplePanelPresentational';
import ServerEventsPanelPresentational from './ServerEventsPanelPresentational';
import StructuredDataExplorerPresentational from './StructuredDataExplorerPresentational';

const ActiveServerPresentational = () => {

    const reduxState = useSelector((state: IReduxState) => state);
    const reduxDispatch = useDispatch();

    useEffect(() => {
        reduxDispatch(retrieveNumberOfEventsPerHourCommand());
    }, [reduxDispatch]);

    if (reduxState.activeServer.server?.id === null) {
        return (<Redirect to='/servers/' />);
    }

    const activeServer = reduxState.activeServer;
    const server = activeServer.server;

    return (
        <Fragment>
            <ServerTimelinePresentational
                initialSelectedTimelineIntervalStart={DatetimeHelper.timelineConfig.selectedTimelineIntervalStart}
                initialSelectedTimelineIntervalEnd={DatetimeHelper.timelineConfig.selectedTimelineIntervalEnd}
                currentSelectedTimelineIntervalStart={new Date(activeServer.selectedTimelineIntervalStart)}
                currentSelectedTimelineIntervalEnd={new Date(activeServer.selectedTimelineIntervalEnd)}
                timelineIntervalStart={new Date(activeServer.timelineIntervalStart)}
                timelineIntervalEnd={new Date(activeServer.timelineIntervalEnd)}
                numberOfEventsPerHour={server?.numberOfEventsPerHour ?? []}
                onUpdateCallback={ (start: string, end: string) => reduxDispatch(activeServerSlice.actions.selectedTimelineIntervalsUpdatedEvent({
                    selectedTimelineIntervalStart: start,
                    selectedTimelineIntervalEnd: end
                })) }
                onChangeCallback={ () => {
                    reduxDispatch(retrieveEventsCommand());
                    if (   activeServer.eventLoadedInStructuredDataExplorer !== null
                        && activeServer.activeStructuredDataExplorerAttributes.length > 0
                    ) {
                        reduxDispatch(retrieveStructuredDataExplorerEventsCommand());
                    }
                }}
            />

            {
                (activeServer.eventLoadedInStructuredDataExplorer !== null)
                &&
                <div className='card bg-dark m-2 mt-4'>
                    <StructuredDataExplorerPresentational
                        server={server!}
                        event={activeServer.eventLoadedInStructuredDataExplorer}
                        onCloseClicked={ () => reduxDispatch(activeServerSlice.actions.closeStructuredDataExplorerCommand()) }
                    />
                </div>
            }

            {
                activeServer.eventLoadedInStructuredDataExplorer === null
                &&
                <div className='m-2'>
                    <div className='card bg-dark mt-4'>
                        <div className='card-header border-bottom border-dark'>
                            <div className='row'>
                                <div className='text-primary col server-headline-icon'>
                                    {
                                        (!server!.hasOwnProperty('type') || server!.type === null || server!.type === 'default')
                                        &&
                                        <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                    }
                                    {
                                        server!.type === 'dayz'
                                        &&
                                        <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                    }
                                </div>
                                <div className='col server-headline-title'>
                                    <h4 className='mb-0'>
                                        {server!.title}
                                    </h4>
                                </div>

                                <div className='col align-content-end'>
                                    <X
                                        className='float-end clickable'
                                        width='36px'
                                        height='36px'
                                        onClick={() => reduxDispatch(activeServerSlice.actions.closeActiveServerCommand())}
                                    />
                                </div>
                            </div>
                        </div>

                        <ServerInformationPanelContainer />

                        <ServerExamplePanelPresentational
                            server={server!}
                            isOpen={activeServer.examplePanelIsOpen}
                            onSwitch={() => reduxDispatch(activeServerSlice.actions.switchExamplePanelCommand())}
                        />

                        <ServerEventsPanelPresentational />

                    </div>
                </div>
            }
        </Fragment>
    );
};

export default ActiveServerPresentational;
