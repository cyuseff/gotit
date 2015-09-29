var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (<div>
      <h5>Or use socials</h5>
      <ul className="list-inline">
        <li><button className="btn btn-default">Facebook</button></li>
        <li><button className="btn btn-default">Google</button></li>
        <li><button className="btn btn-default">Twitter</button></li>
      </ul>
    </div>);
  }
});
