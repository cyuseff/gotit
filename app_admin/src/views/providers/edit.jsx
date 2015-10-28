var React = require('react')
  , Reflux = require('reflux')
  , ProviderStore = require('../../stores/providers')
  , Actions = require('../../actions')
  , Form = require('./_form')
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
            saveTeaxt="Save"/>
        </div>

        <div className="col-md-4">
        </div>
      </div>);
    } else {
      return <Loading />;
    }
  }

});
