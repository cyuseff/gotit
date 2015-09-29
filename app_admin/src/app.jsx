var React = require('react')
  , ReactRouter = require('react-router')
  , HashHistory = require('react-router/lib/hashhistory')
  , Router = ReactRouter.Router
  , Route = ReactRouter.Route
  , Main = require('./components/main');

var routes = (
  <Router history={new HashHistory}>
    <Route path="/" component={Main}></Route>
  </Router>
);

React.render(routes, document.body);
