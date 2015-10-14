var React = require('react')
  , ReactDom = require('react-dom');

function getRoute(refs) {
  var url = ReactDom.findDOMNode(refs.url)
    , methodAll = ReactDom.findDOMNode(refs.methodAll)
    , methodGet = ReactDom.findDOMNode(refs.methodGet)
    , methodPost = ReactDom.findDOMNode(refs.methodPost)
    , methodPut = ReactDom.findDOMNode(refs.methodPut)
    , methodDelete = ReactDom.findDOMNode(refs.methodDelete)
    , methods = []
    , recursive = ReactDom.findDOMNode(refs.recursive)
    , accessLevel = ReactDom.findDOMNode(refs.routeAccessLevel)
    , route;

  if(methodAll.checked) methods.push(methodAll.value);
  if(!methodGet.disabled && methodGet.checked) methods.push(methodGet.value);
  if(!methodPost.disabled && methodPost.checked) methods.push(methodPost.value);
  if(!methodPut.disabled && methodPut.checked) methods.push(methodPut.value);
  if(!methodDelete.disabled && methodDelete.checked) methods.push(methodDelete.value);

  if(!url.value.trim() || !methods.length) return null;

  route =  {
    url: url.value.trim(),
    methods: methods.toString(),
    recursive: recursive.checked? 1 : 0,
    accessLevel: accessLevel.value
  };

  [methodAll, methodGet, methodPost, methodPut, methodDelete, recursive].forEach(function(inp) {
    inp.checked = inp.disabled = false;
  });
  url.value = accessLevel.value = '';

  return route;
}

module.exports = React.createClass({
  allChecked: function(e) {
    var methods = [
      ReactDom.findDOMNode(this.refs.methodGet),
      ReactDom.findDOMNode(this.refs.methodPost),
      ReactDom.findDOMNode(this.refs.methodPut),
      ReactDom.findDOMNode(this.refs.methodDelete)
    ]
    , disabled = e.target.checked? 'disabled' : false;

    methods.forEach(function(method) { method.disabled = disabled; });
  },
  handleRouteSubmit: function(e) {
    e.preventDefault();
    var route = getRoute(this.refs);

    if(!route) return;
    this.props.addRoute(route);
  },
  render: function() {
    return (<div>
      <h3>Create Route</h3>
      <form onSubmit={this.handleRouteSubmit}>
        <div className="form-group">
          <input type="text" ref="url" className="form-control" placeholder="Url" />
          <small className="help-block">Ex: "provider/:scope/some-nested-route"</small>
        </div>
        <div className="form-group">
          <h5>Methods</h5>
          <div className="checkbox">
            <label><input onChange={this.allChecked} ref="methodAll" value="*" type="checkbox" /> ALL</label>
          </div>
          <label className="checkbox-inline"><input ref="methodGet" value="GET" type="checkbox" /> GET</label>
          <label className="checkbox-inline"><input ref="methodPost" value="POST" type="checkbox" /> POST</label>
          <label className="checkbox-inline"><input ref="methodPut" value="PUT" type="checkbox" /> PUT</label>
          <label className="checkbox-inline"><input ref="methodDelete" value="DELETE" type="checkbox" /> DELETE</label>
        </div>

        <div className="form-group">
          <label><input ref="recursive" type="checkbox" /> Recursive</label>
        </div>

        <div className="form-group">
          <label>Access Level</label>
          <select ref="routeAccessLevel" className="form-control">
            <option value="">Same as Rol</option>
            {this.renderAccessLevel()}
          </select>
        </div>

        <button className="btn btn-default">Add Route</button>
      </form>
    </div>);
  },
  renderAccessLevel: function() {
    var lvls = [];
    for(var i=1; i<10; i++) lvls.push(<option value={i}>{i}</option>);
    return lvls;
  }
});
