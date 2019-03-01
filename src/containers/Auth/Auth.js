import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';
import { auth, setAuthRedirectPath } from '../../store/actions';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import classes from './Auth.module.css';
import { updateObject, checkValidity } from '../../shared/utility';

class Auth extends Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Mail Address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
            }
        },
        isValidForm: false,
        isSignup: true
    };

    componentDidMount() {
        if (!this.props.buildingBurger && this.props.authRedirectPath !== '/') {
            this.props.onSetRedirectPath();
        }
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedControl = updateObject(
            this.state.controls[inputIdentifier],
            {
                value: event.target.value,
                touched: true,
                valid: checkValidity(
                    event.target.value,
                    this.state.controls[inputIdentifier].validation
                )
            }
        );
        const updatedControls = updateObject(this.state.controls, {
            [inputIdentifier]: updatedControl
        });

        let isFormValid = true;
        for (let inputIdentifier in updatedControls) {
            if (updatedControls[inputIdentifier].validation) {
                isFormValid =
                    updatedControls[inputIdentifier].valid && isFormValid;
            }
        }
        this.setState({
            controls: updatedControls,
            isValidForm: isFormValid
        });
    };

    submitHandler = event => {
        event.preventDefault();
        this.props.onAuth(
            this.state.controls.email.value,
            this.state.controls.password.value,
            this.state.isSignup
        );
    };

    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return { isSignup: !prevState.isSignup };
        });
    };

    render() {
        const formElementsArray = [];
        for (let key in this.state.controls) {
            formElementsArray.push({
                id: key,
                config: this.state.controls[key]
            });
        }

        const form = formElementsArray.map(el => (
            <Input
                key={el.id}
                elementType={el.config.elementType}
                elementConfig={el.config.elementConfig}
                value={el.config.value}
                invalid={!el.config.valid}
                shouldValidate={el.config.validation}
                touched={el.config.touched}
                changed={event => this.inputChangedHandler(event, el.id)}
            />
        ));

        let errorMessage = null;
        if (this.props.error) {
            errorMessage = <p>{this.props.error}</p>;
        }

        let content = (
            <React.Fragment>
                <form onSubmit={this.submitHandler}>
                    <h3>{this.state.isSignup ? 'SIGN UP' : 'SIGN IN'}</h3>
                    {errorMessage}
                    {form}
                    <Button
                        btnType="Success"
                        disabled={!this.state.isValidForm}
                    >
                        SUBMIT
                    </Button>
                </form>
                <Button clicked={this.switchAuthModeHandler} btnType="Danger">
                    SWITCH TO {this.state.isSignup ? 'SIGN IN' : 'SIGN UP'}
                </Button>
            </React.Fragment>
        );
        if (this.props.loading) {
            content = <Spinner />;
        }

        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />;
        }

        return (
            <div className={classes.Auth}>
                {authRedirect}
                {content}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password) => dispatch(auth(email, password)),
        onSetRedirectPath: () => {
            dispatch(setAuthRedirectPath('/'));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withErrorHandler(Auth, axios));
