import React from 'react'

import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, NavBrand, NavItem, NavDropdown, Nav, MenuItem } from 'react-bootstrap'

export class Navigation extends React.Component {
  render() {
    return (
      <Navbar>
        <NavBrand>OMC</NavBrand>
        <Nav>
          <LinkContainer to="/"><NavItem eventKey={1}>Home</NavItem></LinkContainer>
          <LinkContainer to="/loot"><NavItem eventKey={2}>Loot</NavItem></LinkContainer>
          <LinkContainer to="/roster"><NavItem eventKey={3}>Roster</NavItem></LinkContainer>
        </Nav>
      </Navbar>
    )
  }
}
