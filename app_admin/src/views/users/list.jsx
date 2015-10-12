var React = require('react')
  , Api = require('../../utils/api')
  , Link = require('react-router').Link;

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
    if(this.props.children) return this.props.children;
    return (<div>
      <h2>Users List</h2>
      <ul className="list-unstyled">
        {this.renderList()}
      </ul>
    </div>);
  },
  renderList: function() {
    return this.state.users.map(function(user) {
      return (<li>
        <Link to={'/users/' + user._id}><h4>{user.fullName}</h4></Link>
        <small>{user.emails.toString()}</small>
      </li>);
    });
  }
});
