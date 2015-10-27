var React = require('react')
  , Link = require('react-router').Link
  , Reflux = require('reflux')
  , UserStore = require('../../stores/user')
  , Actions = require('../../actions')
  , UserHeader = require('./user-header');

var menu = [
  {name: 'Users', slug: 'users'},
  {name: 'Roles', slug: 'roles'},
  {name: 'Providers', slug: 'providers'}
];

var MenuItem = React.createClass({
  render: function() {
    return (<li>
      <Link to={'/'+this.props.item.slug}>{this.props.item.name}</Link>
    </li>);
  }
});

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UserStore, 'onChange')
  ],
  getInitialState: function() {
    return {user: UserStore.user};
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
        return <MenuItem key={item.slug} item={item} />;
      });
    }
  },
  renderUser: function() {
    if(this.state.user) return (<li><UserHeader user={this.state.user} /></li>);
  },
  onChange: function() {
    this.setState({user: UserStore.user});
  }
});
