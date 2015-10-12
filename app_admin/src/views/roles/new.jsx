var React = require('react')
  , Api = require('../../utils/api');

function getRoute(refs) {
  var url = React.findDOMNode(refs.url)
    , methodAll = React.findDOMNode(refs.methodAll)
    , methodGet = React.findDOMNode(refs.methodGet)
    , methodPost = React.findDOMNode(refs.methodPost)
    , methodPut = React.findDOMNode(refs.methodPut)
    , methodDelete = React.findDOMNode(refs.methodDelete)
    , methods = []
    , recursive = React.findDOMNode(refs.recursive)
    , accessLevel = React.findDOMNode(refs.routeAccessLevel)
    , route;

  if(methodAll.checked) methods.push(methodAll.value);
  if(!methodGet.disabled && methodGet.checked) methods.push(methodGet.value);
  if(!methodPost.disabled && methodPost.checked) methods.push(methodPost.value);
  if(!methodPut.disabled && methodPut.checked) methods.push(methodPut.value);
  if(!methodDelete.disabled && methodDelete.checked) methods.push(methodDelete.value);

  if(!url.value || !methods.length) return null;

  route =  {
    url: url.value,
    methods: methods.toString(),
    recursive: recursive.checked? 1 : 0,
    accessLevel: accessLevel.value
  };

  [methodAll, methodGet, methodPost, methodPut, methodDelete, recursive].map(function(inp) {
    inp.checked = false;
    inp.disabled = false;
  });
  accessLevel.value = '';

  return route;
}

module.exports = React.createClass({
  getInitialState: function() {
    return {routes: []};
  },
  handleRolSubmit: function(e) {
    e.preventDefault();
    var rolName = React.findDOMNode(this.refs.rolName).value
      , accessLevel = React.findDOMNode(this.refs.accessLevel).value;

    if(!rolName || !accessLevel || !this.state.routes.length) return;
    var rol = {
      name: rolName,
      accessLevel: accessLevel,
      routes: this.state.routes
    };

    Api.post('admin/roles', rol)
      .then(function(res) {
        console.log(res);
      });

    console.log(rol);
  },
  handleRouteSubmit: function(e) {
    e.preventDefault();
    var route = getRoute(this.refs)
      , routes = this.state.routes;

    if(!route) return;

    routes.push(route);
    this.setState({routes: routes});
  },
  allChecked: function(e) {
    var methods = [
      React.findDOMNode(this.refs.methodGet),
      React.findDOMNode(this.refs.methodPost),
      React.findDOMNode(this.refs.methodPut),
      React.findDOMNode(this.refs.methodDelete)
    ]
    , disabled = e.target.checked? 'disabled' : false;

    methods.map(function(method) { method.disabled = disabled; });
  },
  removeRoute: function(e) {
    e.preventDefault();
    var id = parseInt(e.target.rel)
      , routes = this.state.routes;

    routes.splice(id, 1);
    this.setState({routes: routes});
  },
  render: function() {
    return (<div>
      <div className="row">
        <div className="col-md-8">
          <form onSubmit={this.handleRolSubmit}>
            <button className="pull-right btn btn-primary">Create</button>
            <h2>New Rol</h2>

            <div className="form-group">
              <input type="text" ref="rolName" className="form-control" placeholder="Nombre" />
            </div>

            <div className="form-group">
              <label>Access Level</label>
              <select ref="accessLevel" className="form-control">
                {this.renderAccessLevel()}
              </select>
            </div>

            <hr />
            <h3>Routes</h3>
            {this.renderRoutes()}
          </form>
        </div>

        <div className="col-md-4">
          <h3>Create Route</h3>
          <form onSubmit={this.handleRouteSubmit}>
            <div className="form-group">
              <input type="text" ref="url" className="form-control" placeholder="Url" />
              <small className="help-block">Ex: "/provider/:scope/some-nested-route"</small>
            </div>
            <div className="form-group">
              <h5>Methods</h5>
              <div class="checkbox">
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
        </div>
      </div>


    </div>);
  },

  renderRoutes: function() {
    var me = this;
    return this.state.routes.map(function(route, idx) {
      return (<li>
        <a onClick={me.removeRoute} rel={idx} className="pull-right">Borrar</a>
        <h4>{route.url}</h4>
        <ul>
          <li>Methods: {route.methods}</li>
          <li>Recursive: {route.recursive}</li>
          <li>AccessLevel: {route.accessLevel}</li>
        </ul>
      </li>);
    });
  },

  renderAccessLevel: function() {
    var lvls = [];
    for(var i=1; i<10; i++) lvls.push(<option value={i}>{i}</option>);
    return lvls;
  }

});
