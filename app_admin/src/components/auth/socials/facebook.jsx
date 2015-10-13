var React = require('react')
  , Actions = require('../../../actions');

window.fbAsyncInit = function() {
  FB.init({
    appId      : '909396282439703',
    xfbml      : false,
    version    : 'v2.4',
    cookie     : true
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/es_CL/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

function checkPermissions(scopes, cb) {
  var requireds = ['email', 'public_profile'];

  for(var i=0, l=requireds.length; i<l; i++) {
    if(scopes.indexOf(requireds[i]) === -1) return cb(true);
  }
  return cb();
}

function logIn(cb, reAsk) {
  var opts = {
    scope: 'email',
    return_scopes: true
  };
  if(reAsk) opts.auth_type = 'rerequest';

  FB.login(function(res) {
    if(!res.status) return cb(new Error('Opps!'));
    return cb(null, {
      token: res.authResponse.accessToken,
      uid: res.authResponse.userID,
      scopes: res.authResponse.grantedScopes
    });
  }, opts);
}

module.exports = React.createClass({
  getInitialState: function() {
    return {err: false};
  },
  logInFacebook: function() {
    var me = this;
    logIn(function(err, data) {
      if(err) return;
      me.uid = data.uid;
      me.token = data.token;

      checkPermissions(data.scopes, function(err) {
        if(err) {
          me.setState({err: true});
          return;
        }
        Actions.signInFacebook(me.uid, me.token);
      });
    }, this.state.err);
  },
  render: function() {
    return (<div>
      <button onClick={this.logInFacebook} className="btn btn-default">Facebook</button>
      {this.renderError()}
    </div>);
  },
  renderError: function() {
    if(this.state.err) {
      return (<small>Es necesario proporcionar un email.</small>);
    }
  }
});
