var React = require('react')
  , Reflux = require('reflux')
  , UsersStore = require('../../stores/users')
  , Actions = require('../../actions')
  , Roles = require('./_roles')
  , Loading = require('../../components/loading');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UsersStore, 'onChange')
  ],
  getInitialState: function() {
    return {user: null};
  },
  componentDidMount: function() {
    Actions.getUser(this.props.params.userId);
  },
  onChange: function() {
    this.setState({user: UsersStore.user});
  },

  addRol: function(rolId, scope) {
    Actions.addRolToUser(this.state.user._id, rolId, scope);
  },

  removeRol: function(rolId, scope) {
    Actions.removeRolToUser(this.state.user._id, rolId, scope);
  },

  render: function() {
    if(!this.state.user) return <Loading />;
    return (<div>
      <h2>{this.state.user.fullName}</h2>
      <small>{this.state.user._id}</small>

      <div className="row">
        <div className="col-md-8">
          <ul>
            {this.renderProps()}
          </ul>
        </div>
        <div className="col-md-4">
          <h3>Add Rol to User</h3>
          <Roles addRol={this.addRol} removeRol={this.removeRol} userRoles={this.state.user.roles} />
        </div>
      </div>
    </div>);
  },
  renderProps: function() {
    var map = [];
    for(var i in this.state.user) {
      map.push(<li>{i}: {this.state.user[i].toString()}</li>);
    }
    return map;
  }
});
