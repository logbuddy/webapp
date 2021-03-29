import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ArrowClockwise, Clipboard, ChevronRight, ChevronDown, Disc, PlayCircle, PauseCircle } from 'react-bootstrap-icons';
import {
    createServerCommand,
    retrieveServerListCommand,
    flipServerListElementOpenCommand,
    flipServerListElementCloseCommand,
    retrieveYetUnseenServerEventsCommand,
    disableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    enableSkipRetrieveYetUnseenServerEventsOperationsCommand
} from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'

class ServersContainer extends Component {
    constructor(props) {
        super(props);
        let filterEventsInputTexts = {};
        for (let i = 0; i < this.props.reduxState.servers.serverList; i++) {
            filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id] = '';
        }
        this.state = { createServerTitle: '', showCopySuccessBadgeForId: null, filterEventsInputTexts };
        this.copyElements = {};
    }

    isFlippedOpen = (serverId, elementName) => {
        return this.props.reduxState.servers.serverListOpenElements[elementName].includes(serverId);
    };

    handleRefreshClicked = () => {
        this.props.dispatch(retrieveServerListCommand());
    }

    handleChangeCreateServerTitle = (event) => {
        this.setState({ ...this.state, createServerTitle: event.target.value });
    }

    handleChangeFilterEventsInputText = (event, serverId) => {
        const filterEventsInputTexts = { ...this.state.filterEventsInputTexts };
        filterEventsInputTexts[serverId] = event.target.value;
        this.setState({ ...this.state, filterEventsInputTexts });
    }

    handleCreateServerClicked = (event) => {
        event.preventDefault();
        this.props.dispatch(createServerCommand(this.state.createServerTitle));
        this.setState({ ...this.state, createServerTitle: '' });
    }

    handleFlipElementOpenClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementOpenCommand(server.id, elementName));
        if (elementName === 'latestEvents') {
            this.props.dispatch(retrieveYetUnseenServerEventsCommand(
                server.id,
                server.latestEventSortValue
            ));
        }
    }

    handleFlipElementCloseClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementCloseCommand(server.id, elementName));
    }

    copyCodeToClipboard = (id) => {
        const el = this.copyElements[id];
        el.select();
        document.execCommand('copy');
        el.blur();
        this.setState({ ...this.state, showCopySuccessBadgeForId: id });
    }

    componentDidMount() {
        this.props.dispatch(retrieveServerListCommand());
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        const createFlipElement = (server, elementName) => {
            const elementNameToHeadline = {
                information: 'Information',
                sampleCurlCommand: 'Sample curl command',
                latestEvents: 'Latest entries',
            };
            if (this.isFlippedOpen(server.id, elementName)) {
                const handleFlipElementCloseClicked = this.handleFlipElementCloseClicked;
                return <Fragment>
                    <div>
                        <span className='clickable' onClick={() => handleFlipElementCloseClicked(server, elementName)}>
                            <span className='align-text-top small'>
                                <ChevronDown />
                            </span>
                            &nbsp;
                            { elementNameToHeadline[elementName] }
                        </span>
                        {
                            elementName === 'latestEvents'
                            &&
                            <Fragment>
                                <div className='small float-end text-light mb-2'>
                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        &&
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(disableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Not polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PlayCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning not-spinning spinning-small text-white' />
                                        </div>
                                    }

                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        ||
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PauseCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning spinning-small text-primary' />
                                        </div>
                                    }
                                </div>
                                <hr className='float-none text-dark'/>
                            </Fragment>
                        }
                    </div>
                </Fragment>
            } else {
                const handleFlipElementOpenClicked = this.handleFlipElementOpenClicked;
                return <div className='clickable' onClick={() => handleFlipElementOpenClicked(server, elementName)}>
                    <span className='small align-text-bottom'>
                        <ChevronRight />
                    </span>
                    &nbsp;
                    { elementNameToHeadline[elementName] }
                </div>;
            }
        };

        const serverListElements = [];
        for (let i=0; i < this.props.reduxState.servers.serverList.length; i++) {
            const serverEventElements = [];
            let index = 0;
            for (let j=0; j < this.props.reduxState.servers.serverList[i].latestEvents.length; j++) {
                const payload = this.props.reduxState.servers.serverList[i].latestEvents[j].payload;
                let parsedPayload = '';
                try {
                    parsedPayload = JSON.parse(payload);
                } catch (e) {}
                let payloadToShow = '';
                if ('"' + parsedPayload + '"' === payload) {
                    payloadToShow = parsedPayload;
                } else {
                    payloadToShow = payload;
                }

                if (this.state.filterEventsInputTexts.hasOwnProperty(this.props.reduxState.servers.serverList[i].id) === false
                    ||
                    (     this.state.filterEventsInputTexts.hasOwnProperty(this.props.reduxState.servers.serverList[i].id)
                       && payloadToShow.toLowerCase().includes(this.state.filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id].toLowerCase())
                    )
                ) {
                    serverEventElements.push(
                        <Fragment>
                            <div key={index} className='row'>
                                <div className='col-auto ps-1 pe-1'>
                                    <code className='text-white-50 text-nowrap'>
                                        {this.props.reduxState.servers.serverList[i].latestEvents[j].createdAt}
                                    </code>
                                </div>
                                <div className='col-xxl-1 col-xl-2 col-lg-2 col-md-3 ps-1 pe-1'>
                                    <code className='text-secondary word-wrap-anywhere'>
                                        {this.props.reduxState.servers.serverList[i].latestEvents[j].source}
                                    </code>
                                </div>
                                <div className='col ps-1 pe-1'>
                                    <code className='text-white-75 word-wrap-anywhere'>
                                        {payloadToShow}
                                    </code>
                                </div>
                            </div>
                            <div key={j + 'gutter'} className='d-md-none d-sm-block border-top border-dark'>&nbsp;</div>
                        </Fragment>
                    );
                    index = index + 1;
                }
            }

            const sampleCurlCommand = `curl \\
  -X POST \\
  "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \\
  -d '{ "userId": "${this.props.reduxState.servers.serverList[i].userId}",
        "apiKeyId": "${this.props.reduxState.servers.serverList[i].apiKeyId}",
        "serverId": "${this.props.reduxState.servers.serverList[i].id}",
        "events": [{
                     "createdAt": "'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'",
                     "source": "uptime on '"$(hostname)"'",
                     "payload": "'"$(uptime)"'"
                   }]}'`;

            serverListElements.push(
                <div key={i} className={`card bg-dark mt-4 ${this.props.reduxState.servers.retrieveServerListOperation.isRunning ? 'opacity-25' : 'fade-in'}`}>
                    <div className='card-header border-bottom border-dark'>
                        <div className='row'>
                            <div className='text-primary col server-headline-icon'>
                                <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                            </div>
                            <div className='col server-headline-title'>
                                <h4 className='mb-0'>{this.props.reduxState.servers.serverList[i].title}</h4>
                            </div>
                        </div>
                    </div>
                    <div className='card-body bg-dark'>
                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'information') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'information')
                            &&
                            <Fragment>
                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>serverId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].id}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'id'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'id'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => {
                                                    this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'id');
                                                }}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>userId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].userId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'userId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'userId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'userId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>apiKeyId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].apiKeyId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'apiKeyId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'apiKeyId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'apiKeyId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </Fragment>
                        }


                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'sampleCurlCommand') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'sampleCurlCommand')
                            &&
                            <Fragment>
                                <div className='mb-2 mt-2 bg-deepdark pt-2 ps-4 pe-3 rounded border border-dark border-3'>
                                    <code><pre>{sampleCurlCommand}</pre></code>
                                </div>
                                <hr/>
                            </Fragment>
                        }

                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'latestEvents') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length > 0
                            &&
                            <div className='container-fluid w-100 bg-deepdark pt-2 pb-2 ps-4 pe-3 rounded border border-dark border-3'>

                                <div key='filters' className='row'>
                                    <div className='col ms-0 ps-0 me-1 pe-0 mb-2'>
                                        <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                                        <div className='input-group'>
                                            <div className='input-group-text bg-dark border-dark'>Filter events</div>
                                            <input
                                                type='text'
                                                className='form-control bg-secondary text-white-50 border-dark'
                                                id='filter-events-input'
                                                placeholder=''
                                                value={this.state.filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id]}
                                                onChange={
                                                    (event) =>
                                                        this.handleChangeFilterEventsInputText(event, this.props.reduxState.servers.serverList[i].id)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {serverEventElements}
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length === 0
                            &&
                            <div className='row-cols-auto mt-3'>
                                No entries yet.
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length > 0
                            &&
                            this.state.filterEventsInputTexts.hasOwnProperty(this.props.reduxState.servers.serverList[i].id)
                            &&
                            this.state.filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id].length > 0
                            &&
                            serverEventElements.length === 0
                            &&
                            <div className='row-cols-auto mt-3'>
                                No entries match the current filter.
                            </div>
                        }

                    </div>
                </div>
            );
        }

        return (
            <div className='m-4'>
                <div className='text-end float-end'>
                    <Fragment>
                        {
                            this.props.reduxState.servers.retrieveServerListOperation.isRunning
                            &&
                            <Disc className={`text-light ${this.props.reduxState.servers.retrieveServerListOperation.isRunning ? 'spinning' : 'spinning not-spinning'}`} />
                        }
                        {
                            this.props.reduxState.servers.retrieveServerListOperation.isRunning
                            ||
                            <span className='clickable' onClick={this.handleRefreshClicked}><ArrowClockwise className='spinning not-spinning' /></span>
                        }
                    </Fragment>
                </div>

                <ErrorMessagePresentational message={this.props.reduxState.servers.retrieveServerListOperation.errorMessage} />

                <h1 className='mb-3'>
                    My servers
                </h1>

                <div className='card card-body bg-dark pt-0'>
                    <form className='row row-cols-sm-auto g-3 mt-2 mb-2' onSubmit={this.handleCreateServerClicked}>
                        <div className='col-12'>
                            <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                            <div className='input-group'>
                                <div className='input-group-text'>Add server</div>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='create-server-title'
                                    placeholder='Name of new server'
                                    value={this.state.createServerTitle}
                                    onChange={this.handleChangeCreateServerTitle}
                                />
                            </div>
                        </div>

                        <div className='col-12'>
                            {
                                this.props.reduxState.servers.createServerOperation.isRunning
                                &&
                                <button className='float-end btn btn-warning disabled'>Adding...</button>
                            }
                            {
                                this.props.reduxState.servers.createServerOperation.isRunning
                                ||
                                (
                                    (this.state.createServerTitle.length > 0)
                                    &&
                                    <button type='submit' className='float-end btn btn-success fade-in'>Add</button>
                                )
                            }
                        </div>
                    </form>
                </div>

                {serverListElements}
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ServersContainer);
