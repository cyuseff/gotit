var React = require('react')
  , Roles = require('./_roles')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      user: {},
      roles: []
    };
  },
  componentDidMount: function() {
    Api.get('admin/users/' +  this.props.params.userId)
      .then(function(res) {
        this.setState({
          user: res.user,
          roles: res.user.roles
        });
      }.bind(this));
  },
  addRol: function(rolId, scope) {
    Api.post('admin/roles/'+rolId+'/assign', {
      userId: this.state.user._id,
      scope: scope
    })
    .then(function(res) {
      console.log(res);
      if(!res.error) this.componentDidMount();
    }.bind(this));
  },
  render: function() {
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
          <Roles addRol={this.addRol} userRoles={this.state.roles} />
        </div>
      </div>
    </div>);
  },
  renderProps: function() {
    var map = [];
    for(var i in this.state.user) {
      map.push(<li>{i}: {this.state.user[i]}</li>);
    }
    return map;
  }
});
