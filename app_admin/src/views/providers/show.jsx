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
