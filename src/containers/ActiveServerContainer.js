import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { closeActiveServerCommand } from '../redux/reducers/activeServer';
import ServerEventPresentational from '../presentationals/ServerEvent';
import ServerTimelinePresentational from '../presentationals/ServerTimeline';

class ActiveServerContainer extends Component {
    render() {
        if (this.props.reduxState.activeServer.server.id === null) {
            return (<Redirect to='/servers/' />);
        }

        const activeServer = this.props.reduxState.activeServer;

        const eventElements = [];
        for (let event of this.props.reduxState.activeServer.server.events) {
            eventElements.push(<ServerEventPresentational serverEvent={event} />);
        }

        return (
            <Fragment>
                <ServerTimelinePresentational
                    selectedTimelineIntervalStart={activeServer.selectedTimelineIntervalStart}
                    selectedTimelineIntervalEnd={activeServer.selectedTimelineIntervalEnd}
                    numbersOfEventsPerHour={activeServer.server.numbersOfEventsPerHour}
                    onUpdateCallback={ () => ({}) }
                    onChangeCallback={ () => ({}) }
                />
                <div className='m-2'>
                    <div>
                        <button
                            className='btn btn-warning'
                            onClick={() => this.props.dispatch(closeActiveServerCommand())}
                        >
                            Close
                        </button>
                    </div>

                    <div className={`card bg-dark mt-4`}>
                        <div className='card-header border-bottom border-dark'>
                            <div className='row'>
                                <div className='text-primary col server-headline-icon'>
                                    {
                                        (!activeServer.server.hasOwnProperty('type') || activeServer.server.type === null || activeServer.server.type === 'default')
                                        &&
                                        <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                    }
                                    {
                                        activeServer.server.type === 'dayz'
                                        &&
                                        <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                    }
                                </div>
                                <div className='col server-headline-title'>
                                    <h4 className='mb-0'>
                                        {activeServer.server.title}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeServer.server.id}
                    <div>
                        {eventElements}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ActiveServerContainer);
