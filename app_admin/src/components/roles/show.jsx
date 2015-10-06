var React = require('react')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {rol: {}};
  },
  componentDidMount: function() {
    Api.get('admin/roles/' +  this.props.params.rolId)
      .then(function(rol) {
        this.setState({rol: rol});
      }.bind(this));
  },
  render: function() {
    return (<div>
      <h3>{this.state.rol.name}</h3>
      <small>{this.state.rol.id} -  {this.state.rol.accessLevel}</small>
      <ul>
        {this.renderRoutes()}
      </ul>
    </div>);
  },
  renderRoutes: function() {
    if(!this.state.rol.routes) return;
    return this.state.rol.routes.map(function(route) {
      return (<li>
        <div>url: {route.url}</div>
        <div>methods: {route.methods}</div>
        <div>recursive: {route.recursive}</div>
      </li>);
    });
  }
});
