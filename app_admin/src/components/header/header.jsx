var React = require('react')
  , Link = require('react-router').Link
  , Reflux = require('reflux')
  , UserStore = require('../../stores/user')
  , Actions = require('../../actions')
  , UserHeader = require('./user-header');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UserStore, 'onChange')
  ],
  getInitialState: function() {
    return {user: null};
  },
  render: function() {
    return (<nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">GotIt</Link>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            <li><Link to="/">Home</Link></li>
            <li><Link to="about">About</Link></li>
            <li>{this.renderUser()}</li>
          </ul>
        </div>
      </div>
    </nav>);
  },
  renderUser: function() {
    if(this.state.user) {
      return (<UserHeader user={this.state.user} />);
    }
  },
  onChange: function(e, err) {
    if(!err) this.setState({user: UserStore.user});
  }
});
