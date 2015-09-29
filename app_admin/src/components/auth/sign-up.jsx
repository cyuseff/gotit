var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (<div>
      <form>
        <div className="row">
          <div className="col-xs-6">
            <div className="form-group">
              <input type="text" placeholder="Nombre" className="form-control" rel="first_name" required />
            </div>
          </div>
          <div className="col-xs-6">
            <div className="form-group">
              <input type="text" placeholder="Apellido" className="form-control" rel="last_name" required />
            </div>
          </div>
        </div>

        <div className="form-group">
          <input type="text" placeholder="Email" className="form-control" rel="email" required />
        </div>

        <div className="row">
          <div className="col-xs-6">
            <div className="form-group">
              <input type="password" placeholder="Password" className="form-control" rel="password" required />
            </div>
          </div>
          <div className="col-xs-6">
            <div className="form-group">
              <input type="password" placeholder="Confirmar password" className="form-control" rel="confirm_password" required />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>);
  }
});
