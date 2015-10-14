var React = require('react')
  , Reflux = require('reflux')
  , RolesStore = require('../../stores/roles')
  , Actions = require('../../actions')
  , Link = require('react-router').Link
  , Loading = require('../../components/loading');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(RolesStore, 'onChange')
  ],
  getInitialState: function() {
    return {rol: null};
  },
  componentDidMount: function() {
    Actions.getRol(this.props.params.rolId);
  },
  onChange: function() {
    this.setState({rol: RolesStore.rol});
  },

  handleClick: function(e) {
    e.preventDefault();
    if(confirm('Sure?')) Actions.removeRol(this.props.params.rolId);
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
      {this.renderRol()}
    </div>);
  },
  renderRol: function() {
    if(this.state.rol) {
      return (<div>
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
    } else {
      return <Loading />;
    }
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
