var React = require('react')
  , ReactDom = require('react-dom')
  , Form = require('./_form')
  , Locations = require('./_locations');

module.exports = React.createClass({
  getInitialState: function() {
    return {provider: {}};
  },

  addLocation: function(location) {
    var provider = this.state.provider;
    if(provider.locations) {
      provider.locations.push(location);
    } else {
      provider.locations = [location];
    }
    this.setState({provider: provider});
  },

  render: function() {
    return (<div>
      <h2>New Provider</h2>
      <div className="row">
        <div className="col-md-8">
          <Form {...this.state.provider} />
        </div>

        <div className="col-md-4">
          <Locations addLocation={this.addLocation} />
        </div>
      </div>
    </div>);
  }
});
