var React = require('react')
  , Api = require('../../utils/api')
  , Link = require('react-router').Link;

var UserList = React.createClass({
  render: function() {
    return (<li>
      <Link to={'/users/' + this.props.user._id}><h4>{this.props.user.fullName}</h4></Link>
      <small>{this.props.user.emails.toString()}</small>
    </li>);
  }
});

module.exports = React.createClass({
  getInitialState: function() {
    return {users: []};
  },
  componentDidMount: function() {
    Api.get('admin/users')
      .then(function(res) {
        this.setState({users: res.users});
      }.bind(this));
  },
  render: function() {
    return (<div>
      <h2>Users List</h2>
      <ul className="list-unstyled">
        {this.state.users.map(function(user) {
          return <UserList key={user._id} user={user} />;
        })}
      </ul>
    </div>);
  }
});
