var React = require('react')
  , Reflux = require('reflux')
  , UserStore = require('../stores/user')
  , Actions = require('../actions')
  , Header = require('./header/header')
  , Auth = require('./auth/auth');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(UserStore, 'onChange')
  ],
  getInitialState: function() {
    return {token: null};
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
    if(!this.state.token) return (<Auth />);
    if(this.props.children) return this.props.children;
  },
  onChange: function(e, err) {
    if(err) return;
    this.setState({token: UserStore.token});
  }
});
