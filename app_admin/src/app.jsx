var React = require('react');

var Hello = React.createClass({
  render: function() {
    return (<h1>Hello</h1>);
  }
});

React.render(
  <Hello />,
  document.querySelector('.container')
);
