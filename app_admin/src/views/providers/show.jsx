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

  handleClick: function(e) {
    e.preventDefault();
    if(confirm('Sure?')) Actions.removeProvider(this.props.params.providerId);
  },

  render: function() {
    if(this.state.provider) {
      return (<div>

        <div className="pull-right">
          <Link to={'/providers/' +  this.props.params.providerId + '/edit'} className="btn btn-default">
            <i className="fa fa-edit"></i> Edit
          </Link>
          <button onClick={this.handleClick} className="btn btn-danger">
            <i className="fa fa-trash"></i> Delete
          </button>
        </div>

        <div className="margin-b-md">
          <h2>{this.state.provider.name}</h2>
          <small>{this.state.provider.slug}</small>
          <p>{this.state.provider.description}</p>
        </div>

        <h3>Locations</h3>
        <ul>{this.renderLocations()}</ul>
      </div>);
    } else {
      return <Loading />;
    }
  },

  renderLocations: function() {
    return this.state.provider.locations.map(function(location, idx) {
      return <li className="margin-b-sm" key={idx}>
        <div><strong>Name:</strong> {location.name}</div>
        <div><strong>Address:</strong> {location.address}</div>
        <div><strong>Coords:</strong> {location.coords[0]}:{location.coords[1]}</div>
      </li>;
    });
  }
});
