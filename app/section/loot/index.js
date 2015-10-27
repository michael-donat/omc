import React from 'react'

import { store, actions } from './domain'

import { Table } from 'react-bootstrap'

var data = require('./../../../cache/loot.json')
var _ = require('lodash')

class LootItem extends React.Component {

  render() {

    let className = this.props.tick ? 'success' : null;

    return (
      <tr className={className} onClick={this.toggle.bind(this)}>
        <td><img src={'https://bungie.net'+this.props.item.icon} /></td>
        <td>{this.props.item.name}</td>
        <td>{this.props.item.description}</td>
        <td>{this.props.item.type}</td>
        <td>
          <span>
          {(() => {
            return this.props.tick ? 'GOT IT' : 'STILL MISSING'
          })()}
          </span>
        </td>
      </tr>
    )
  }

  toggle() {
    actions.toggle(this.props.hash)
  }

}

class LootGroup extends React.Component {
  header(id) {
    switch(id) {
      case '0': return 'Titan';
      case '1': return 'Hunter';
      case '2': return 'Warlock';
      case '3': return 'Weapons';
      case '4': return 'Exotics';
      default: return id;
    }
  }
  render() {
    let ticked = this.props.ticked;
    let header
    return (
      <tbody>
        <tr>
          <th colSpan="5">{this.header(this.props.group)}</th>
        </tr>
        {this.props.items.map(function(item) {
          let tick = ticked.indexOf(item.hash) > -1
          return <LootItem key={item.hash} hash={item.hash} item={item} tick={tick}/>
        })}
      </tbody>
    )
  }
}

class LootTable extends React.Component {
  render() {
    let groups = [];
    _.forOwn(this.props.items, function(items, key) {
      groups.push(<LootGroup key={key} group={key} items={items} ticked={this.props.ticked}/>)
    }, this)

    return (
      <Table bordered hover id='loot-table'>
        {groups}
      </Table>
    );
  }
}

class LootSection extends React.Component {

  constructor(...args) {
    super(...args)
    this.state = {ticked: store.getTicked()}
  }

  render() {

    return (
      <div className="row">
        <div className="col-md-12">
          <LootTable items={data.items} ticked={this.state.ticked}/>
        </div>
      </div>
    );
  }
  componentDidMount() {
    store.addChangeListener(this.update.bind(this))
  }

  componentWillUnmount() {
    store.removeChangeListener(this.update.bind(this))
  }

  update() {
    this.setState({ticked: store.getTicked()})
  }
}

export default LootSection
