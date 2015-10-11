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
    return {
      token: null,
      isReady: false
    };
  },
  componentDidMount: function() {
    Actions.getProfile();
  },
  render: function() {
    if(!this.state.isReady) {
      return (<div>Loading...</div>)
    } else {
      return (<div>
        <Header />
        <div className="content container">
          {this.content()}
        </div>
      </div>);
    }
  },
  content: function() {
    if(!this.state.token) return (<Auth />);
    if(this.props.children) return this.props.children;
  },
  onChange: function(e, err) {
    if(err) {
      this.setState({ isReady: true });
    } else {
      this.setState({
        token: UserStore.token,
        isReady: true
      });
    }
  }
});
