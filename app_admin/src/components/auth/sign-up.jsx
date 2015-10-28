var React = require('react')
  , ReactDom = require('react-dom')
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

    var first_name = ReactDom.findDOMNode(this.refs.first_name).value
      , last_name = ReactDom.findDOMNode(this.refs.last_name).value
      , email = ReactDom.findDOMNode(this.refs.email).value
      , password = ReactDom.findDOMNode(this.refs.password).value
      , confirm_password = ReactDom.findDOMNode(this.refs.confirm_password).value;

    if(!first_name || !last_name || !email || !password || !confirm_password) return;
    Actions.signIn({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
      confirm_password: confirm_password
    });
  },
  render: function() {
    return (<div>
      {this.renderError()}
      <form onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="col-xs-6">
            <div className="form-group">
              <input type="text" placeholder="Nombre" className="form-control" ref="first_name" required />
            </div>
          </div>
          <div className="col-xs-6">
            <div className="form-group">
              <input type="text" placeholder="Apellido" className="form-control" ref="last_name" required />
            </div>
          </div>
        </div>

        <div className="form-group">
          <input type="text" placeholder="Email" className="form-control" ref="email" required />
        </div>

        <div className="row">
          <div className="col-xs-6">
            <div className="form-group">
              <input type="password" placeholder="Password" className="form-control" ref="password" required />
            </div>
          </div>
          <div className="col-xs-6">
            <div className="form-group">
              <input type="password" placeholder="Confirmar password" className="form-control" ref="confirm_password" required />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Sign Up</button>
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
