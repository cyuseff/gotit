var React = require('react')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      name: this.props.name,
      accessLevel: this.props.accessLevel
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var rolName = React.findDOMNode(this.refs.rolName).value
      , accessLevel = React.findDOMNode(this.refs.accessLevel).value;

    if(!rolName || !accessLevel || !this.props.routes.length) return;
    var rol = {
      name: rolName,
      accessLevel: accessLevel,
      routes: this.props.routes
    };

    if(this.props.action === 'PUT') {
      Api.put('admin/roles/' + this.props.id, rol)
        .then(function(res) {
          window.location.href = '/#/roles';
        });
    } else {
      Api.post('admin/roles', rol)
        .then(function(res) {
          window.location.href = '/#/roles';
        });
    }
  },

  handleTextChange: function(e) {
    this.setState({name: e.target.value});
  },

  handleSelectChange: function(e) {
    this.setState({accessLevel: e.target.value});
  },

  render: function() {
    return (<form onSubmit={this.handleSubmit}>
      <div className="form-group">
        <input
          value={this.state.name}
          onChange={this.handleTextChange}
          type="text"
          ref="rolName"
          className="form-control"
          placeholder="Nombre" />
      </div>

      <div className="form-group">
        <label>Access Level</label>
        <select ref="accessLevel" onChange={this.handleSelectChange} value={this.state.accessLevel} className="form-control">
          {this.renderAccessLevel()}
        </select>
      </div>

      <hr />
      <h3>Routes</h3>
      {this.renderRoutes()}

      <button className="btn btn-primary">{this.props.saveTeaxt || 'Create'}</button>
    </form>);
  },

  renderRoutes: function() {
    var me = this;
    if(this.props.routes) {
      return this.props.routes.map(function(route, idx) {
        return (<li key={'route-'+idx}>
          <a onClick={me.props.removeRoute} rel={idx} className="pull-right">Borrar</a>
          <h4>{route.url}</h4>
          <ul>
            <li>Methods: {route.methods}</li>
            <li>Recursive: {route.recursive}</li>
            <li>AccessLevel: {route.accessLevel}</li>
          </ul>
        </li>);
      });
    }
  },

  renderAccessLevel: function() {
    var lvls = [];
    for(var i=1; i<10; i++) {
      lvls.push(<option value={i}>{i}</option>);
    }
    return lvls;
  }
});