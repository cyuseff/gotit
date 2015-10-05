var React = require('react')
  , List = require('./list');

module.exports = React.createClass({
  render: function() {
    if(this.props.children) {
      return this.props.children;
    } else {
      return <List />;
    }
  }
});

/*
  TODO: Rol should return a singleton exposing all sub-components
*/
