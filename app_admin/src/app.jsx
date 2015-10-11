var React = require('react')
  , ReactRouter = require('react-router')
  , Router = ReactRouter.Router
  , Route = ReactRouter.Route
  , IndexRoute = ReactRouter.IndexRoute;
  /*, h = require('history');

var history = h.useBasename(h.createHistory)({
  basename: '/'
});*/

React.render((
  <Router>
    <Route path="/" component={require('./components/main')}>
      <Route path="roles">
        <IndexRoute component={require('./views/roles/list')}/>
        <Route path=":rolId" component={require('./views/roles/show')} />
      </Route>
      <Route path="users">
        <IndexRoute component={require('./views/users/list')}/>
        <Route path=":userId" component={require('./views/users/show')} />
      </Route>
    </Route>
  </Router>
), document.body);
