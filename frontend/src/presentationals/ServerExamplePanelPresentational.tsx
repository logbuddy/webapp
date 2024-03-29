import React from 'react';
import { ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { IServer } from '../redux/slices/serversSlice';

const ServerExamplePanelPresentational = ({ server, isOpen, onSwitch }:
                                              { server: IServer, isOpen: boolean, onSwitch: () => any }) => (
    <div className='card-body bg-dark pt-0 pb-0'>
        <div
            className='clickable'
            onClick={ () => onSwitch() }
        >
            <span className='small align-text-bottom'>
                {
                    isOpen
                    &&
                    <ChevronDown />
                }
                {
                    isOpen
                    ||
                    <ChevronRight />
                }
            </span>
            &nbsp;
            Sample curl command
        </div>
        {
            isOpen
            &&
            <div className='mb-2 mt-2 bg-deepdark pt-2 ps-2 pe-3 rounded border border-dark border-3'>
                <code><pre>{`curl \\
  -X POST \\
  "https://app.logbuddy.io/api/server-events" \\
  -d '{ "userId": "${server.userId}",
        "apiKeyId": "${server.apiKeyId}",
        "serverId": "${server.id}",
        "events": [{
                     "createdAt": "'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'",
                     "source": "uptime on '"$(hostname)"'",
                     "payload": {"uptime": "'"$(uptime)"'"}
                   }]}'`}</pre></code>
            </div>
        }
        <hr/>
    </div>
);

export default ServerExamplePanelPresentational;
