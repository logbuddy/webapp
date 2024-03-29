import React from 'react';
import { format } from 'date-fns';
// @ts-ignore
import TimeRange from 'react-timeline-range-slider';
// @ts-ignore
import { DatetimeHelper } from 'herodot-webapp-shared';
import ActiveServerToolboxPresentational from './ActiveServerToolboxPresentational';

const ServerTimelinePresentational = (
    {
        initialSelectedTimelineIntervalStart,
        initialSelectedTimelineIntervalEnd,
        currentSelectedTimelineIntervalStart,
        currentSelectedTimelineIntervalEnd,
        timelineIntervalStart,
        timelineIntervalEnd,
        numberOfEventsPerHour,
        onUpdateCallback,
        onChangeCallback
    }:
        {
            initialSelectedTimelineIntervalStart: Date,
            initialSelectedTimelineIntervalEnd: Date,
            currentSelectedTimelineIntervalStart: Date,
            currentSelectedTimelineIntervalEnd: Date,
            timelineIntervalStart: Date,
            timelineIntervalEnd: Date,
            numberOfEventsPerHour: Array<number>,
            onUpdateCallback: (start: string, end: string) => any,
            onChangeCallback: () => any
        }) => {

    const numberOfEventsPerHourElements = []

    let largestNumber = 0;
    for (let numberOfEvents of numberOfEventsPerHour) {
        if (numberOfEvents > largestNumber) {
            largestNumber = numberOfEvents;
        }
    }

    let i = 0;
    for (let numberOfEvents of numberOfEventsPerHour) {
        numberOfEventsPerHourElements.push(
            <div
                key={i}
                className='bg-success d-inline-block align-bottom'
                style={{width: '0.520833333333333%', height: `${22 / largestNumber * numberOfEvents}px`}}
            />
        );
        i++;
    }

    return (
        <div className='w-100 m-0 sticky-top bg-deepdark border-secondary border-bottom border-1 p-2'>
            <div className='container-fluid timeline-info-container'>
                <div className='row tiny text-secondary'>
                    <div className='col align-self-start'>
                        {format(currentSelectedTimelineIntervalStart, 'PPPP')}
                        <br/>
                        {format(currentSelectedTimelineIntervalStart, 'p')}
                    </div>
                    <div className='col align-self-end text-end'>
                        {format(currentSelectedTimelineIntervalEnd, 'PPPP')}
                        <br/>
                        {format(currentSelectedTimelineIntervalEnd, 'p')}

                        <ActiveServerToolboxPresentational />
                    </div>
                </div>
            </div>

            <div className='react_time_range__time_range_container number-of-elements-per-hour-container'>
                <div style={{position: 'relative', width: '100%'}}>
                    {numberOfEventsPerHourElements}
                </div>
            </div>
            <TimeRange
                mode={1}
                error={false}
                ticksNumber={DatetimeHelper.timelineConfig.ticksNumber}
                formatTick={(ms: number) =>
                    `${format(new Date(ms), 'LLL')} ${format(new Date(ms), 'd')}`
                }
                step={60 * 60 * 1000 / 4}
                selectedInterval={[
                    initialSelectedTimelineIntervalStart,
                    initialSelectedTimelineIntervalEnd,
                ]}
                timelineInterval={[
                    timelineIntervalStart,
                    timelineIntervalEnd
                ]}
                onUpdateCallback={ (v: { time: Array<Date>}) => onUpdateCallback(DatetimeHelper.dateObjectToUTCDatetimeString(v.time[0]), DatetimeHelper.dateObjectToUTCDatetimeString(v.time[1])) }
                onChangeCallback={ () => onChangeCallback() }
            />
        </div>
    )
};

export default ServerTimelinePresentational;
