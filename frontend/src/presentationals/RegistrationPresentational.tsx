import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ErrorMessagePresentational from './ErrorMessagePresentational';
import { IReduxState } from '../redux/slices/root';
import { Redirect } from 'react-router-dom';
import { registerAccountCommand } from '../features/session/sessionSlice';

const RegistrationPresentational = () => {

    const reduxState = useSelector((state: IReduxState) => state);
    const reduxDispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (reduxState.session.isLoggedIn) {
        return (<Redirect to='/' />);
    }

    if (reduxState.session.registrationOperation.justFinishedSuccessfully) {
        return (<Redirect to='/login' />);
    }

    return (
        <Fragment>
            {
                reduxState.session.registrationOperation.justFinishedSuccessfully
                &&
                <Redirect to='/login' />
            }

            {
                reduxState.session.registrationOperation.justFinishedSuccessfully
                ||
                <div className='container-fluid ps-4 mt-4'>
                    <div className='row'>
                        <div className='col-xs-auto col-sm-12 col-md-8 col-lg-6 col-xl-4'>
                            <h1>Registration</h1>
                            <ErrorMessagePresentational message={reduxState.session.registrationOperation.errorMessage} />
                            <form
                                onSubmit={ e => { reduxDispatch(registerAccountCommand({ email, password })); e.preventDefault(); } }
                                className='mt-4'
                            >
                                <div className="mb-4">
                                    <input className='form-control' type='text' name='name' data-testid='email-input' placeholder='E-Mail' value={email} onChange={ e => setEmail(e.target.value) } />
                                </div>
                                <div className="mb-4">
                                    <input className='form-control' type='password' name='password' data-testid='password-input' placeholder='Password' value={password} onChange={ e => setPassword(e.target.value) } />
                                </div>
                                <div className="mt-4 mb-3">
                                    {
                                        reduxState.session.registrationOperation.isRunning
                                        &&
                                        <button className='btn btn-warning disabled'>Processing registration...</button>
                                    }
                                    {
                                        reduxState.session.registrationOperation.isRunning
                                        ||
                                        <button className='btn btn-primary' type='submit' data-testid='submit-button'>Register</button>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            }
        </Fragment>
    );
};

export default RegistrationPresentational;
