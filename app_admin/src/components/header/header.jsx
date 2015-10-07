var React = require('react')
  , Link = require('react-router').Link
  , Reflux = require('reflux')
  , UserStore = require('../../stores/user')
  , Actions = require('../../actions')
  , UserHeader = require('./user-header');

var menu = [
  {name: 'Users', slug: 'users'},
  {name: 'Roles', slug: 'roles'}
];

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
            {this.renderMenu()}
            {this.renderUser()}
          </ul>
        </div>
      </div>
    </nav>);
  },
  renderMenu: function() {
    if(this.state.user) {
      return menu.map(function(item) {
        return (<li><Link to={'/'+item.slug}>{item.name}</Link></li>);
      });
    }
  },
  renderUser: function() {
    if(this.state.user) return (<li><UserHeader user={this.state.user} /></li>);
  },
  onChange: function(e, err) {
    if(!err) this.setState({user: UserStore.user});
  }
});
