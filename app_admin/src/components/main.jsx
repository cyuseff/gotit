var React = require('react')
  , Header = require('./header')
  , Auth = require('./auth/auth');

module.exports = React.createClass({
  getInitialState: function() {
    return {user: false};
  },
  render: function() {
    return (<div>
      <Header />
      <div className="content container">
        {this.content()}
      </div>
    </div>);
  },
  content: function() {
    if(!this.state.user) return (<Auth />);
    if(this.props.children) return this.props.children;
  }
});
