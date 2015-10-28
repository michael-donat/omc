import React from 'react'

import { store, actions } from './domain'

import { Table } from 'react-bootstrap'

import Loader from 'react-loader';

var moment = require('moment')

var data = require('./../../../cache/members.json')
var _ = require('lodash')

class Member extends React.Component {

  render() {

    let onlineStatus = null;

    if (this.props.member.status.online) {
      onlineStatus = (
        <span className="label label-success">
          Online ({moment.duration(this.props.member.status.duration, "seconds").humanize()})
        </span>
      )
    } else {
      onlineStatus = (
        <span className="label">
          Offline ({moment.unix(this.props.member.status.lastSeen).fromNow()})
        </span>
      )
    }

    let activity = null;

    if (this.props.member.activity) {
      activity = this.props.member.activity.type + ' - ' + this.props.member.activity.name
    }

    return (
      <tr>
        <td><img src={'https://bungie.net'+this.props.member.member.avatar} /></td>
        <td>{this.props.member.member.name.bungie}</td>
        <td>{this.props.member.member.name.platform}</td>
        <td>--</td>
        <td>{this.props.member.member.clan.name}</td>
        <td>{onlineStatus}</td>
        <td>{activity}</td>

      </tr>
    )
  }
}

class RosterTable extends React.Component {
  render() {

    let rows = []

    this.props.members.forEach(function(member) {
      rows.push(<Member key={member.member.id.destiny} member={member} />)
    })

    return (
      <Table bordered hover id='roster-table'>
        <thead>
          <tr>
            <th colSpan="2">User</th>
            <th>PSN</th>
            <th>Grimoire</th>
            <th>Clan</th>
            <th>Status</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </Table>
    );
  }
}

class RosterSection extends React.Component {

  constructor(...args) {
    super(...args)
    this.state = {loaded: false, data: []}
  }

  render() {

    return (
      <div className="row">
        <div className="col-md-12">
          <Loader loaded={this.state.loaded}>
            <RosterTable members={this.state.data} />
          </Loader>
        </div>
      </div>
    );
  }
  componentDidMount() {
    store.addChangeListener(this.update.bind(this))
    actions.refresh()
  }

  componentWillUnmount() {
    store.removeChangeListener(this.update.bind(this))
  }

  update() {
    console.log('calling ypdate')
    this.setState({loaded: true, data: store.all()})
  }
}

export default RosterSection
