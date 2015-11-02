var React = require('react')
  , Reflux = require('reflux')
  , ProviderStore = require('../../stores/providers')
  , Actions = require('../../actions')
  , Form = require('./_form')
  , Locations = require('./_locations')
  , Loading = require('../../components/loading');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(ProviderStore, 'onChange')
  ],
  getInitialState: function() {
    return {provider: null};
  },
  componentDidMount: function() {
    Actions.getProvider(this.props.params.providerId);
  },
  onChange: function() {
    this.setState({provider: ProviderStore.provider});
  },

  addLocation: function(location) {
    var provider = this.state.provider;
    provider.locations.push(location);
    this.setState({provider: provider});
  },

  render: function() {
    return (<div>
      <h2>Edit Provider</h2>
      {this.renderForm()}
    </div>);
  },

  renderForm: function() {
    if(this.state.provider) {
      return (<div className="row">
        <div className="col-md-8">
          <Form
            action="PUT"
            {...this.state.provider}
            saveTeaxt="Save"
          />
        </div>

        <div className="col-md-4">
          <Locations addLocation={this.addLocation} />
        </div>
      </div>);
    } else {
      return <Loading />;
    }
  }

});
