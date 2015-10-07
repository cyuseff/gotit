var React = require('react')
  , Api = require('../../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {user: {}};
  },
  componentDidMount: function() {
    Api.get('admin/users/' +  this.props.params.userId)
      .then(function(res) {
        this.setState({user: res.user});
      }.bind(this));
  },
  render: function() {
    return (<div>
      <h3>{this.state.user.fullName}</h3>
      <small>{this.state.user._id}</small>

      <ul>
        {this.renderProps()}
      </ul>
    </div>);
  },
  renderProps: function() {
    var map = [];
    for(var i in this.state.user) {
      map.push(<li>{i}: {this.state.user[i]}</li>);
    }
    return map;
  }
});
