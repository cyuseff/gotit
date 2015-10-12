var React = require('react')
  , Form = require('./_form')
  , Routes = require('./_routes')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      name: '',
      accessLevel: null,
      routes: []
    };
  },

  componentDidMount: function() {
    Api.get('admin/roles/' +  this.props.params.rolId)
      .then(function(rol) {
        this.setState({
          name: rol.name,
          accessLevel: rol.accessLevel,
          routes: rol.routes
        });
      }.bind(this));
  },

  addRoute: function(route) {
    var routes = this.state.routes;
    routes.push(route);
    this.setState({routes: routes});
  },

  removeRoute: function(e) {
    e.preventDefault();
    var id = parseInt(e.target.rel)
      , routes = this.state.routes;

    routes.splice(id, 1);
    this.setState({routes: routes});
  },

  render: function() {
    return (<div>
      <h2>Edit Rol</h2>
      <div className="row">
        <div className="col-md-8">
          <Form
            action="PUT"
            id={this.props.params.rolId}
            name={this.state.name}
            accessLevel={this.state.accessLevel}
            routes={this.state.routes}
            removeRoute={this.removeRoute} />
        </div>

        <div className="col-md-4">
          <Routes addRoute={this.addRoute} />
        </div>
      </div>
    </div>);
  }

});
