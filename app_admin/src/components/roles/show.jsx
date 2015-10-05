var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (<div>Rol Show {this.props.params.rolId}</div>);
  }
});
