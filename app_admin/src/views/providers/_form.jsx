var React = require('react')
  , ReactDom = require('react-dom')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      name: this.props.name,
      slug: this.props.slug,
      description: this.props.description,
      error: null
    };
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.state.name.trim()
      , slug = this.state.slug.trim()
      , description = this.state.description.trim();

    if(!name || !slug || !description) return;

    var provider = {
      name: name,
      slug: slug,
      description: description,
      locations: this.props.locations
    };

    if(this.props.action === 'PUT') {
      Api.patch('admin/providers/' + this.props.slug, provider)
        .then(function(res) {
          this.handleResponse(res);
        }.bind(this));
    } else {
      Api.post('admin/providers', provider)
        .then(function(res) {
          this.handleResponse(res);
        }.bind(this));
    }
  },
  handleResponse: function(res) {
    if(res.error && res.error.code !== 118) {
      this.setState({error: res.error.msg});
    } else {
      window.location.href = '/#/providers/' + res.provider.slug;
    }
  },

  handleTextChange: function(e) {
    var state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  },

  render: function() {
    return (<form onSubmit={this.handleSubmit}>
      <div className="form-group">
        <input
          value={this.state.name}
          onChange={this.handleTextChange}
          type="text"
          className="form-control"
          placeholder="Nombre"
          name="name"
          required="required"
        />
      </div>

      <div className="form-group">
        <input
          value={this.state.slug}
          onChange={this.handleTextChange}
          type="text"
          className="form-control"
          placeholder="slug"
          name="slug"
          required="required"
        />
        {this.renderError()}
      </div>

      <div className="form-group">
        <textarea
          value={this.state.description}
          onChange={this.handleTextChange}
          className="form-control"
          rows="6"
          placeholder="Descripción"
          name="description"
          required="required"
        ></textarea>
      </div>

      <hr />
      <h3>Locations</h3>
      <ul>
        {this.renderLocations()}
      </ul>

      <button className="btn btn-primary">{this.props.saveTeaxt || 'Create'}</button>
    </form>);
  },

  renderError: function() {
    if(this.state.error) {
      return (<small className="red">
        <em><i className="fa fa-warning"></i> {this.state.error}</em>
      </small>);
    }
  },

  renderLocations: function() {
    if(!this.props.locations) return;
    return this.props.locations.map(function(location, idx) {
      return <li className="margin-b-sm" key={idx}>
        <div><strong>Name:</strong> {location.name}</div>
        <div><strong>Address:</strong> {location.address}</div>
        <div><strong>Coords:</strong> {location.coords[0]}:{location.coords[1]}</div>
      </li>;
    });
  }
});
