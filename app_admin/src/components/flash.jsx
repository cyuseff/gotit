var React = require('react')
  , Reflux = require('reflux')
  , FlashStore = require('../stores/flash');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(FlashStore, 'onChange')
  ],
  getInitialState: function() {
    return {
      err: FlashStore.err,
      msg: FlashStore.msg,
      rand: 0
    };
  },
  render: function() {
    if(this.state.msg || this.state.err) {
      return (<div key={this.state.rand || this.state.err} className="flash-holder">
        <div className={this.state.err? 'flash-content flash-error' : 'flash-content'}>
          {this.state.msg || this.state.err}
        </div>
      </div>);
    } else {
      return <span></span>;
    }
  },
  onChange: function() {
    if(FlashStore.err || FlashStore.msg) {
      this.setState({
        err: FlashStore.err,
        msg: FlashStore.msg,
        rand: Math.random() * 100000
      });
    }
  }
});
