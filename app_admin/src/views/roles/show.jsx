var React = require('react')
  , Api = require('../../utils/api')
  , Link = require('react-router').Link;

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
  handleClick: function(e) {
    e.preventDefault();
    if(confirm('Sure?')) {
      Api.del('admin/roles/' + this.props.params.rolId)
        .then(function(res) {
          console.log(res);
          window.location.href = '/#/roles';
        });
    }
  },
  render: function() {
    return (<div>
      <div className="pull-right">
        <Link to={'/roles/edit/' +  this.props.params.rolId} className="btn btn-default">
          <i className="fa fa-edit"></i> Edit
        </Link>
        <button onClick={this.handleClick} className="btn btn-danger">
          <i className="fa fa-trash"></i> Delete
        </button>
      </div>

      <div className="margin-b-md">
        <h3>{this.state.rol.name}</h3>
        <small>{this.state.rol.id}</small>

        <div>AccesLevel: {this.state.rol.accessLevel}</div>
      </div>

      <h5><strong>Routes:</strong></h5>
      <ul className="list-unstyled">
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
        <div>accessLevel: {route.accessLevel}</div>
      </li>);
    });
  }
});
