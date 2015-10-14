var React = require('react')
  , ReactCSSTransitionGroup = require('react-addons-css-transition-group')
  , Reflux = require('reflux')
  , FlashStore = require('../stores/flash');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(FlashStore, 'onChange')
  ],
  getInitialState: function() {
    return {
      err: FlashStore.err,
      msg: FlashStore.msg
    };
  },
  render: function() {
    if(this.state.msg || this.state.err) {
      return (<div className="flash-holder">
        <div className={this.state.err? 'flash-content flash-error' : 'flash-content'}>
          {this.state.msg || this.state.err}
        </div>
      </div>);
    } else {
      return <span></span>;
    }
  },
  onChange: function() {
    this.setState({
      err: FlashStore.err,
      msg: FlashStore.msg
    });
  }
});
