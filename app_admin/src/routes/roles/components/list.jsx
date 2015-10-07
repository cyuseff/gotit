var React = require('react')
  , Api = require('../../../utils/api')
  , Link = require('react-router').Link;

module.exports = React.createClass({
  getInitialState: function() {
    return {roles: []};
  },
  componentDidMount: function() {
    Api.get('admin/roles')
      .then(function(res) {
        console.log(res);
        this.setState({roles: res.roles});
      }.bind(this));
  },
  render: function() {
    if(this.props.children) return this.props.children;
    return (<div>
      <h2>Rol List</h2>
      <ul className="list-unstyled">
        {this.renderList()}
      </ul>
    </div>);
  },
  renderList: function() {
    return this.state.roles.map(function(rol) {
      return (<li>
        <Link to={'/roles/' + rol.id}><h4>{rol.name}</h4></Link>
        <small>{rol.id}</small>
      </li>);
    });
  }
});
