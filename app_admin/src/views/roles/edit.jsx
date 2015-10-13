var React = require('react')
  , Reflux = require('reflux')
  , RolesStore = require('../../stores/roles')
  , Actions = require('../../actions')
  , Form = require('./_form')
  , Routes = require('./_routes')
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

  addRoute: function(route) {
    var rol = this.state.rol;
    rol.routes.push(route);
    this.setState({rol: rol});
  },

  removeRoute: function(e) {
    e.preventDefault();
    var id = parseInt(e.target.rel)
      , rol = this.state.rol;

    rol.routes.splice(id, 1);
    this.setState({rol: rol});
  },

  render: function() {
    return (<div>
      <h2>Edit Rol</h2>
      {this.renderForm()}
    </div>);
  },

  renderForm: function() {
    if(this.state.rol) {
      return (<div className="row">
        <div className="col-md-8">
          <Form
            action="PUT"
            {...this.state.rol}
            removeRoute={this.removeRoute}
            saveTeaxt="Save"/>
        </div>

        <div className="col-md-4">
          <Routes addRoute={this.addRoute} />
        </div>
      </div>);
    } else {
      return <Loading />;
    }
  }

});
