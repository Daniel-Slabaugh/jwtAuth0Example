import Auth0Lock from 'auth0-lock';
import jwtDecode from 'jwt-decode';

const tokenIsExpired = (token) => {
  try {
    // we do not check the signature here because we do not want our SECRET on the client side
    const decodedToken = jwtDecode(token);
    return new Date(0).setUTCSeconds(decodedToken.exp) < new Date();
  } catch (e) {
    console.error(e);
    return true;
  }
};

const Prototype = {
  login() {
    // show auth0 popup
    this.lock.show();
  },
  loggedIn() {
    const token = this.getToken();

    if (token) {
      if (!tokenIsExpired(token)) {
        return true;
      }

      this.logout();
    }

    return false;
  },
  logout() {
    localStorage.removeItem('id_token');
  },
  setToken(idToken) {
    // save token in local storage
    localStorage.setItem('id_token', idToken)
  },
  getToken() {
    return localStorage.getItem('id_token');
  },
};

export default {
  create(onLoggedIn) {
    const obj = Object.create(Prototype);

    // replace ClientId and Domain with you auth0 params
    obj.lock = new Auth0Lock('ClientId', 'Domain', {
      auth: {
        redirectUrl: 'http://localhost:3000',
        responseType: 'token',
        params: {
          // with this param we can control what will get included in the payload of the returned JWT
          scope: 'openid email app_metadata',
        },
      },
    });

    // Add callback for lock `authenticated` event
    obj.lock.on('authenticated', (authResult) => {
      obj.setToken(authResult.idToken);
      onLoggedIn(obj);
    });

    return obj;
  },
};

