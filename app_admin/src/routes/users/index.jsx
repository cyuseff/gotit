import List from './components/list'
import Show from './components/show'

module.exports = {
  path: 'users',
  component: List,
  childRoutes: [{
    path: ':userId',
    component: Show
  }]
}
