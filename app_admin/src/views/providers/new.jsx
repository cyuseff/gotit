var React = require('react')
  , ReactDom = require('react-dom')
  , Form = require('./_form');

module.exports = React.createClass({

  render: function() {
    return (<div>
      <h2>New Provider</h2>
      <div className="row">
        <div className="col-md-8">
          <Form />
        </div>

        <div className="col-md-4">
        </div>
      </div>
    </div>);
  }
});
