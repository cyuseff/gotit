var React = require('react')
  , Actions = require('../../actions');

module.exports = React.createClass({
  render: function() {
    return (<div>
      <div className="white">
        {this.props.user.fullName}
      </div>
      <small>
        <a className="gray" href="#" onClick={this.handleClick}>LogOut</a>
      </small>
    </div>);
  },
  handleClick: function(e) {
    e.preventDefault();
    Actions.logOutUser();
  }
});
