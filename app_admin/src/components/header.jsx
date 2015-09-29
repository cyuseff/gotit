var React = require('react')
  , Link = require('react-router').Link;

module.exports = React.createClass({
  render: function() {
    return <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">GotIt</a>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            <li className="active"><a href="#">Home</a></li>
            <li><Link to="about">About</Link></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>;
  }
});
