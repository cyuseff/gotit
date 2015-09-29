var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (<div>
      <form>
        <div className="form-group">
          <input type="text" placeholder="Email" className="form-control" rel="email" required />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Password" className="form-control" rel="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Sign In</button>
      </form>
    </div>);
  }
});
