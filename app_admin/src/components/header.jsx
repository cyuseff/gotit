var React = require('react')
  , Link = require('react-router').Link;

module.exports = React.createClass({
  render: function() {
    return (<nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">GotIt</Link>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            <li><Link to="/">Home</Link></li>
            <li><Link to="about">About</Link></li>
          </ul>
        </div>
      </div>
    </nav>);
  }
});
