import React, { useState } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { FormControl, InputLabel, Input, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { getSettings, getTenant, getSettingsTenantId } from '../selectors';
import { accountsRest } from '../accounts';
import * as Utils from '../utils/utils';
import FormError from '../components/FormError';
import { ApplyCode } from '../client';
import { accountsEvent, accountsEventOnError} from '../client/accounts.events'
import Card from '../components/Card';
import Logo from '../components/Logo';
import LocalizedInput from '../components/LocalizedInput';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import { login, sendVerificationToken } from '../actions/users';
import {withRouter} from "react-router-dom";
import * as GlobalAction from '../actions/global_actions';
import { getCurrentUserId } from '../selectors/entities/users';
import { useCountDown } from "../components/countdown";

const totalSeconds = 60;
const ReApplyCodeBtn = ({ onClick, id, name }) => {
  const [restTime, resetCountdown] = useCountDown(name || "cnt1", {
    total: totalSeconds,
    lifecycle: "session"
  });
  let textColor = "text-blue-600 hover:text-blue-600"
  if (restTime > 0) {
    textColor = "text-gray-300 hover:text-gray-300"
  }
  return (
    <div className="text-sm leading-5 my-4">
      <button type="button"
        id={id}
        disabled={restTime > 0}
        onClick={(e) => {
          if(e.target && e.target.dataset && e.target.dataset.onlyCountDown === "1"){
            resetCountdown();
          }else{
            resetCountdown();
            if(onClick){
              onClick();
            }
          }
        }}
        className={"font-medium focus:outline-none hover:underline transition ease-in-out duration-150 " + textColor}>
      <FormattedMessage
          id='accounts.reSendCode'
          defaultMessage='Get Verify code' 
        />{restTime > 0 ? ` (${restTime}s)` : null}
      </button>
    </div>

  );
};


class Login extends React.Component {

  constructor(props, context) {
    super(props, context);

    let loginId = '';
    if ((new URLSearchParams(this.props.location.search)).get('email')) {
        loginId = (new URLSearchParams(this.props.location.search)).get('email');
    }
    let spaceId = '';
    if ((new URLSearchParams(this.props.location.search)).get('X-Space-Id')) {
      spaceId = (new URLSearchParams(this.props.location.search)).get('email');
    } else if (this.props.settingsTenantId) {
      spaceId = this.props.settingsTenantId
    }

    this.state = {
        // ldapEnabled: this.props.isLicensed && this.props.enableLdap,
        // samlEnabled: this.props.isLicensed && this.props.enableSaml,
        spaceId,
        loginId,
        password: '',
        verifyCode: '',
        showMfa: false,
        loading: false,
        sessionExpired: false,

        loginWith: "password",

        error: ''

        // brandImageError: false,
    };

    if (this.props.tenant.enable_email_code_login || this.props.tenant.enable_mobile_code_login) {
      this.state.loginWith = "verifyCode"
    };

    this.loginIdInput = React.createRef();
    this.passwordInput = React.createRef();


    window.browserHistory = this.props.history;
    document.title = Utils.localizeMessage('accounts.signin') + ` | ${this.props.tenant.name}`;


  }

  createLoginPlaceholder = () => {

    let inputLabel = 'accounts.email_mobile';
    if (this.props.tenant.enable_password_login)
      inputLabel = 'accounts.email_mobile';
    else if (this.props.tenant.enable_mobile_code_login && this.propstenant.enable_email_code_login) 
      inputLabel = 'accounts.email_mobile';
    else if (this.props.tenant.enable_mobile_code_login) 
      inputLabel = 'accounts.mobile';
    else if (this.props.tenant.enable_email_code_login) 
      inputLabel = 'accounts.email';
    
    return Utils.localizeMessage(inputLabel)
  }

  handleLoginIdChange = (e) => {
    this.setState({
        loginId: e.target.value,
    });
  }

  handlePasswordChange = (e) => {
    this.setState({
      password: e.target.value,
    });
  }

  handleCodeChange = (e) => {
    this.setState({
      verifyCode: e.target.value,
    });
  }

  sendVerificationToken = (e) => {
    this.props.actions.sendVerificationToken(this.state.loginId.trim())
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.setState({error: null});

    if(!this.state.loginId.trim()){
      throw new Error('accounts.usernameOrEmailRequired');
    }

    if(!this.state.password.trim()){
      throw new Error('accounts.passwordRequired');
    }

    this.props.actions.login(this.state.loginId.trim(), this.state.password, '').then(async ({error}) => {
      if (error) {
        this.setState({error: error.message});
        return;
      }
      
    });
    this.finishSignin();
  };


  finishSignin = (team) => {
    const query = new URLSearchParams(this.props.location.search);
    const redirectTo = query.get('redirect_to');

    // Utils.setCSRFFromCookie();

    // Record a successful login to local storage. If an unintentional logout occurs, e.g.
    // via session expiration, this bit won't get reset and we can notify the user as such.
    // LocalStorageStore.setWasLoggedIn(true);
    if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
      this.props.history.push(redirectTo);
    // } else if (team) {
    //     browserHistory.push(`/${team.name}`);
    } else {
      setTimeout( ()=> {
        GlobalAction.redirectUserToDefaultSpace();
      }, 100);
      
    }
  }

  goSignup = ()=>{
    let state = {};
    if(this.state.loginId.trim().length > 0){
      state =  { email: this.state.loginId.trim() }
    }
    this.props.history.push({
      pathname: `/signup`,
      search: this.props.location.search,
      state: state
    })
  }


  render() {

    return (
    <Card>
        <Logo/>
        <h2 className="mt-6 text-left text-2xl leading-9 font-extrabold text-gray-900">
          <FormattedMessage
              id='accounts.signin'
              defaultMessage='Login'
            />
        </h2>

        <form onSubmit={this.onSubmit} className="mt-4" autoCapitalize="none">

          <div className="rounded-md shadow-sm my-2">
            <div>
              <input 
                id="loginId"
                name="loginId" 
                ref={this.loginIdInput}
                value={this.state.loginId}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5" 
                placeholder={this.createLoginPlaceholder()}
                onChange={this.handleLoginIdChange}
              />
            </div>

            {this.state.loginWith === 'password' && (
                <div class="-mt-px">
                  <input 
                    type="password"
                    id="password"
                    name="password" 
                    value={this.state.password}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5" 
                    placeholder={{id: 'accounts.password', defaultMessage: 'Password'}}
                    onChange={this.handlePasswordChange}
                  />
                </div>
            )}

            {this.state.loginWith === 'verifyCode' && (
                <div class="-mt-px">
                  <LocalizedInput 
                    id="verifyCode"
                    name="verifyCode" 
                    value={this.state.verifyCode}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5" 
                    placeholder={{id: 'accounts.verifyCode', defaultMessage: 'Verify Code'}}
                    onChange={this.handleCodeChange}
                  />
                  <ReApplyCodeBtn onClick={this.sendVerificationToken} id="reApplyCodeBtn"/>
                </div>
            )}
          </div>
          
          {this.state.error && <FormError error={this.state.error} />}

          {this.props.tenant.enable_register &&
          <div className="text-sm leading-5 my-4">
            <FormattedMessage
                  id='accounts.no_account'
                  defaultMessage='No Account?'
              />
            <button type="button" onClick={this.goSignup}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none hover:underline transition ease-in-out duration-150">
              <FormattedMessage
                  id='accounts.signup'
                  defaultMessage='Sign Up'
              />
            </button>
          </div>}

          <div className="mt-6 flex justify-end">
            <button type="submit" className="group relative w-32 justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-none text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out">
              <FormattedMessage
                id='accounts.next'
                defaultMessage='Next'
              />
            </button>
          </div>
        </form>
      </Card>
    );
  };

}

function mapStateToProps(state) {
  return {
    getCurrentUserId: getCurrentUserId(state),
    settings: getSettings(state),
    tenant: getTenant(state),
    settingsTenantId: getSettingsTenantId(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators({
          login,
          sendVerificationToken,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));