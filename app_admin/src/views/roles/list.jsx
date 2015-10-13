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
    return {roles: null};
  },
  componentDidMount: function() {
    Actions.getRoles();
  },
  onChange: function() {
    this.setState({roles: RolesStore.roles});
  },
  render: function() {
    if(this.props.children) return this.props.children;
    return (<div>
      <div className="margin-b">
        <Link to="/roles/new" className="pull-right btn btn-primary">
          <i className="fa fa-plus-circle"></i> New
        </Link>
        <h2>Rol List</h2>
      </div>
      <ul className="list-unstyled">
        {this.renderList()}
      </ul>
    </div>);
  },
  renderList: function() {
    if(this.state.roles) {
      return this.state.roles.map(function(rol) {
        return (<li key={rol.id}>
          <Link to={'/roles/' + rol.id}><h4>{rol.name}</h4></Link>
          <small>{rol.id}</small>
        </li>);
      });
    } else {
      return <Loading />;
    }
  }
});
