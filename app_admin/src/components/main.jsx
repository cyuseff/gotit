var React = require('react')
  , Header = require('./header');

module.exports = React.createClass({
  render: function() {
    return <div>
      <Header />
      <div className="content container">
        {this.content()}
      </div>
    </div>;
  },
  content: function() {
    if(this.props.children) return this.props.children;
  }
});
