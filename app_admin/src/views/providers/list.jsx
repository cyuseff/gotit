var React = require('react')
  , Reflux = require('reflux')
  , ProvidersStore = require('../../stores/providers')
  , Actions = require('../../actions')
  , Link = require('react-router').Link
  , Loading = require('../../components/loading');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(ProvidersStore, 'onChange')
  ],
  getInitialState: function() {
    return {providers: null};
  },
  componentDidMount: function() {
    Actions.getProviders();
  },
  onChange: function() {
    this.setState({providers: ProvidersStore.providers});
  },

  render: function() {
    return (<div>
      <div className="margin-b">
        <h2>Providers List</h2>
      </div>
      <ul className="list-unstyled">
        {this.renderList()}
      </ul>
    </div>);
  },
  renderList: function() {
    if(this.state.providers) {
      return this.state.providers.map(function(provider) {
        return (<li key={provider.slug}>
          <Link to={'/providers/' + provider.slug}><h4>{provider.name}</h4></Link>
          <small>{provider.slug}</small>
        </li>);
      });
    } else {
      return <Loading />;
    }
  }
});
