var React = require('react')
  , ReactRouter = require('react-router')
  , HashHistory = require('react-router/lib/hashhistory')
  , Router = ReactRouter.Router
  , Route = ReactRouter.Route
  , Main = require('./components/main')
  , About = require('./components/about');

React.render((
  <Router history={new HashHistory}>
    <Route path="/" component={Main}>
      <Route path="about" component={About}></Route>
    </Route>
  </Router>
), document.body);
