var React = require('react')
  , ReactDom = require('react-dom');

module.exports = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var name = ReactDom.findDOMNode(this.refs.name)
      , address = ReactDom.findDOMNode(this.refs.address)
      , lat = ReactDom.findDOMNode(this.refs.lat)
      , lon = ReactDom.findDOMNode(this.refs.lon);

    var location = {
      name: name.value,
      address: address.value,
      coords: [parseFloat(lon.value), parseFloat(lat.value)]
    };

    name.value = address.value = lon.value = lat.value = '';
    
    this.props.addLocation(location);
  },
  render: function() {
    return (<div>
      <h3>Add Location</h3>
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input className="form-control" ref="name" placeholder="Name" required="required" />
        </div>

        <div className="form-group">
          <input className="form-control" ref="address" placeholder="Adress" required="required" />
        </div>

        <div className="form-group">
          <div className="row">
            <div className="col-xs-6">
              <input className="form-control" ref="lon" placeholder="Longitude" required="required" />
            </div>
            <div className="col-xs-6">
              <input className="form-control" ref="lat" placeholder="Latitude" required="required" />
            </div>
          </div>
        </div>

        <button className="btn btn-default"><i className="fa fa-plus-circle"></i> Add</button>
      </form>
    </div>);
  }
});
