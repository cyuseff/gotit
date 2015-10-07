import React from 'react'
import { createHistory, useBasename } from 'history'
import { Router, Route } from 'react-router'
import Main from './components/main'

let history = useBasename(createHistory)({
  basename: '/'
})

let rootRoute = {
  path: '/',
  component: Main,
  childRoutes: [
    require('./routes/roles'),
    require('./routes/users')
  ]
}

React.render(<Router routes={rootRoute} />, document.body)
