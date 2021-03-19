import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ErrorMessagePresentational from "../presentationals/ErrorMessagePresentational";
import { registerAccountCommand } from '../redux/reducers/session';

class RegisterContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '' };
    }

    handleChangeEmail = (event) => {
        this.setState({ email: event.target.value, password: this.state.password });
    }

    handleChangePassword = (event) => {
        this.setState({ password: event.target.value, email: this.state.email });
    }

    handleSubmit = (event) => {
        this.props.dispatch(registerAccountCommand(this.state.email, this.state.password));
        event.preventDefault();
    }

    render() {
        if (this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/' />);
        }

        if (this.props.reduxState.session.justFinishedRegistration) {
            return (<Redirect to='/login' />);
        }

        return (
            <div className='m-4'>
                <h1>Registration</h1>
                <ErrorMessagePresentational message={this.props.reduxState.session.registration.errorMessage} />
                <form onSubmit={this.handleSubmit}>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='name'>
                            E-Mail:
                        </label>
                        <input className='form-control' type='text' name='name' value={this.state.email} onChange={this.handleChangeEmail} />
                    </div>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='password'>
                            Password:
                        </label>
                        <input className='form-control' type='password' name='password' value={this.state.password} onChange={this.handleChangePassword} />
                    </div>
                    <div className="mb-3">
                        {
                            this.props.reduxState.session.registration.isProcessing
                            &&
                            <button className='btn btn-warning disabled'>Processing registration...</button>
                        }
                        {
                            this.props.reduxState.session.registration.isProcessing
                            ||
                            <button className='btn btn-primary' type='submit'>Register</button>
                        }
                    </div>
                </form>
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(RegisterContainer);
