var React = require('react')
  , ReactDom = require('react-dom')
  , Reflux = require('reflux')
  , UserStore = require('../../stores/user')
  , Actions = require('../../actions');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UserStore, 'onChange')
  ],
  handleSubmit: function(e) {
    e.preventDefault();

    var email = ReactDom.findDOMNode(this.refs.email).value
      , password = ReactDom.findDOMNode(this.refs.password).value;

    if(!email || !password) return;
    Actions.signIn({email: email, password: password});
  },
  render: function() {
    return (<div>
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
  onChange: function(e) {
    console.log('aca');
    //this.setState({err: UserStore.err});
  }
});
