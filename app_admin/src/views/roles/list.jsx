var React = require('react')
  , Api = require('../../utils/api')
  , Link = require('react-router').Link;

module.exports = React.createClass({
  getInitialState: function() {
    return {roles: []};
  },
  componentDidMount: function() {
    Api.get('admin/roles')
      .then(function(res) {
        this.setState({roles: res.roles});
      }.bind(this));
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
    return this.state.roles.map(function(rol) {
      return (<li key={rol.id}>
        <Link to={'/roles/' + rol.id}><h4>{rol.name}</h4></Link>
        <small>{rol.id}</small>
      </li>);
    });
  }
});
