var React = require('react')
  , ReactDom = require('react-dom')
  , Api = require('../../utils/api');

function _findRolById(id, roles) {
  for(var i=0, l=roles.length; i<l; i++) if(roles[i].id === id) return roles[i];
  return null;
}

module.exports = React.createClass({
  getInitialState: function() {
    return {roles: []};
  },
  componentDidMount: function() {
    Api.get('admin/roles')
      .then(function(roles) {
        this.setState({roles:roles.roles});
      }.bind(this));
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var rolId = ReactDom.findDOMNode(this.refs.rolId)
      , scope = ReactDom.findDOMNode(this.refs.scope);

    this.props.addRol(rolId.value, scope.value);
    rolId.value = scope.value = '';
  },
  handleClick: function(id, e) {
    e.preventDefault();
    this.props.removeRol(id);
  },
  render: function() {
    return (<div>
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <select className="form-control" ref="rolId" required="required">
            <option value="">Select a Rol...</option>
            {this.renderSelect()}
          </select>
        </div>

        <div className="form-group">
          <input type="text" className="form-control" ref="scope" placeholder="Scope" required="required" />
        </div>

        <button className="btn btn-default">
          <i className="fa fa-plus-circle"></i> Add Rol
        </button>
      </form>
      <hr />

      <h3>User Roles</h3>
      <ul>
        {this.renderRoles()}
      </ul>
    </div>);
  },
  renderSelect: function() {
    var me = this;
    return this.state.roles.map(function(rol) {
      return (<option value={rol.id}>{rol.name}</option>);
    });
  },
  renderRoles: function() {
    return this.props.userRoles.map(function(rol, idx) {
      return (<li key={rol.id + '-' + idx}>
        <a onClick={this.handleClick.bind(this, rol.uuid)}><i className="fa fa-trash pull-right"></i></a>
        {this.getRolName(rol.id)}
        <div>Scope: {rol.scope}</div>
        <div>UUID: {rol.uuid}</div>
      </li>);
    }, this);
  },
  getRolName: function(id) {
    var rol = _findRolById(id, this.state.roles);
    if(rol) {
      return (<div>
        <h5>{rol.name}</h5>
        <small className="gray">{id}</small>
      </div>);
    } else {
      return (<div>
        <h5 className="red">
          <i className="fa fa-exclamation-triangle"></i> This Rol is Invalid, remove it!
        </h5>
        <small className="gray">{id}</small>
      </div>);
    }
  }
});
