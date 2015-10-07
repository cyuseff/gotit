import List from './components/list'
import Show from './components/show'

module.exports = {
  path: 'roles',
  component: List,
  childRoutes: [{
    path: ':rolId',
    component: Show
  }]
}
