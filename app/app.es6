import React from 'react'
import {render} from 'react-dom'

import { Router, Route, Link } from 'react-router'

import { Navigation } from './layout'

class Application extends React.Component {
  render() {
    return (
      <div>
        <Navigation />
        {this.props.children}
      </div>
    );
  }
}

import LootSection from './section/loot'
import RosterSection from './section/roster'

render((
  <Router>
    <Route path="/" component={Application}>
      <Route path="loot" component={LootSection}/>
      <Route path="roster" component={RosterSection}/>
    </Route>
  </Router>
), document.querySelector('#content'))
