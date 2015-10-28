var React = require('react')
  , ReactDom = require('react-dom')
  , ReactRouter = require('react-router')
  , Router = ReactRouter.Router
  , Route = ReactRouter.Route
  , IndexRoute = ReactRouter.IndexRoute;
  /*, h = require('history');

var history = h.useBasename(h.createHistory)({
  basename: '/'
});*/

ReactDom.render((
  <Router>
    <Route path="/" component={require('./components/main')}>
      <Route path="roles">
        <IndexRoute component={require('./views/roles/list')}/>
        <Route path="new" component={require('./views/roles/new')} />
        <Route path=":rolId" component={require('./views/roles/show')} />
        <Route path=":rolId/edit" component={require('./views/roles/edit')} />
      </Route>
      <Route path="users">
        <IndexRoute component={require('./views/users/list')}/>
        <Route path=":userId" component={require('./views/users/show')} />
      </Route>
      <Route path="providers">
        <IndexRoute component={require('./views/providers/list')}/>
        <Route path="new" component={require('./views/providers/new')} />
        <Route path=":providerId" component={require('./views/providers/show')} />
        <Route path=":providerId/edit" component={require('./views/providers/edit')} />
      </Route>
    </Route>
  </Router>
), document.getElementById('react-app'));
