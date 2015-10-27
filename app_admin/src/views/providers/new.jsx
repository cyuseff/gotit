var React = require('react')
  , ReactDom = require('react-dom')
  , Api = require('../../utils/api');

module.exports = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var name = ReactDom.findDOMNode(this.refs.name).value
      , slug = ReactDom.findDOMNode(this.refs.slug).value
      , des = ReactDom.findDOMNode(this.refs.description).value;

    Api.post('admin/providers', {
      name: name,
      slug: slug,
      description: des
    })
      .then(function(res) {
        console.log(res);
      });
  },
  render: function() {
    return (<div>
      <h2>New Provider</h2>
      <div className="row">
        <div className="col-md-8">
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <input type="text" className="form-control" placeholder="Nombre" ref="name" />
            </div>

            <div className="form-group">
              <input type="text" className="form-control" placeholder="slug" ref="slug" />
            </div>

            <div className="form-group">
              <textarea className="form-control" rows="6" placeholder="Descripción" ref="description"></textarea>
            </div>

            <button className="btn btn-primary">{this.props.saveTeaxt || 'Create'}</button>
          </form>
        </div>

        <div className="col-md-4">
        </div>
      </div>
    </div>);
  }
});
