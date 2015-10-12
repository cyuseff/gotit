var React = require('react')
  , Form = require('./_form')
  , Routes = require('./_routes');

module.exports = React.createClass({
  getInitialState: function() {
    return {routes: []};
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
      <h2>New Rol</h2>
      <div className="row">
        <div className="col-md-8">
          <Form routes={this.state.routes}
            removeRoute={this.removeRoute} />
        </div>

        <div className="col-md-4">
          <Routes addRoute={this.addRoute} />
        </div>
      </div>
    </div>);
  }

});
