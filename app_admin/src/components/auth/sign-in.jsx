var React = require('react')
  , Reflux = require('reflux')
  , UserStore = require('../../stores/user')
  , Actions = require('../../actions');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UserStore, 'onChange')
  ],
  getInitialState: function() {
    return {err: null};
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var email = React.findDOMNode(this.refs.email).value
      , password = React.findDOMNode(this.refs.password).value;

    if(!email || !password) return;
    Actions.logInUser({email: email, password: password});
  },
  render: function() {
    return (<div>
      {this.renderError()}
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input type="email" placeholder="Email" className="form-control" ref="email" required />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Password" className="form-control" ref="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Sign In</button>
      </form>
    </div>);
  },
  renderError: function() {
    return (<div>{this.state.err}</div>);
  },
  onChange: function(e, err) {
    if(err) this.setState({err: UserStore.err});
  }
});
