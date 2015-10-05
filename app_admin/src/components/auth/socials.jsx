var React = require('react')
  , Facebook = require('./socials/facebook');

module.exports = React.createClass({
  render: function() {
    return (<div>
      <h5>Or use socials</h5>
      <ul className="list-inline">
        <li><Facebook /></li>
        <li><button className="btn btn-default">Google</button></li>
        <li><button className="btn btn-default">Twitter</button></li>
      </ul>
    </div>);
  }
});
