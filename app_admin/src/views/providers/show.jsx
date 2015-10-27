var React = require('react')
  , Reflux = require('reflux')
  , ProviderStore = require('../../stores/providers')
  , Actions = require('../../actions')
  , Link = require('react-router').Link
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
    if(this.state.provider) {
      return (<div>
        <div className="margin-b-md">
          <h3>{this.state.provider.name}</h3>
          <small>{this.state.provider.slug}</small>
          <p>{this.state.provider.description}</p>
        </div>
      </div>);
    } else {
      return <Loading />;
    }
  }
});
