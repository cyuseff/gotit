var React = require('react')
  , ReactRouter = require('react-router')
  , HashHistory = require('react-router/lib/hashhistory')
  , Router = ReactRouter.Router
  , Route = ReactRouter.Route
  , Redirect = ReactRouter.Redirect
  , Main = require('./components/main')
  , Roles = require('./components/roles/index')
  , RolesShow = require('./components/roles/show');

var routes = (
  <Router history={new HashHistory}>
    <Redirect from="/" to="/admin" />
    <Route path="/admin" component={Main}>
      <Route path="roles" component={Roles}>
        <Route path=":rolId" component={RolesShow} />
      </Route>
    </Route>
  </Router>
);

React.render(routes, document.body);
