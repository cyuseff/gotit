var React = require('react')
  , Reflux = require('reflux')
  , UsersStore = require('../../stores/users')
  , Actions = require('../../actions')
  , Link = require('react-router').Link
  , Loading = require('../../components/loading');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UsersStore, 'onChange')
  ],
  getInitialState: function() {
    return {users: null};
  },
  componentDidMount: function() {
    Actions.getUsers();
  },
  onChange: function() {
    this.setState({users: UsersStore.users});
  },

  render: function() {
    return (<div>
      <div className="margin-b">
        <h2>Users List</h2>
      </div>
      <ul className="list-unstyled">
        {this.renderList()}
      </ul>
    </div>);
  },
  renderList: function() {
    if(this.state.users) {
      return this.state.users.map(function(user) {
        return (<li key={user._id}>
          <Link to={'/users/' + user._id}><h4>{user.fullName}</h4></Link>
          <small>{user.emails.toString()}</small>
        </li>);
      });
    } else {
      return <Loading />;
    }
  }
});
