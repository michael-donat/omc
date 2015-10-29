import keyMirror from 'keymirror'
import assign from 'object-assign'

import Dispatcher from './../../dispatcher.es6'

import EventEmitter from 'events'

const CHANGE_EVENT = 'change';

var _ = require('lodash')

const actionKeys = keyMirror({
  REFRESH: null
});

export const actions = {
  refresh: function() {

    Dispatcher.handleAction({
      actionType: actionKeys.REFRESH
    })
  }
}

Dispatcher.register(function(event) {
  switch(event.action.actionType) {
    case actionKeys.REFRESH:

      return service.refresh()

      break;

    default:
      return false;
  }

  store.emitChange()
})

const service = {
  roster: {},
  refresh: function(callback) {
    jQuery.ajax('https://radiant-oasis-5376.herokuapp.com/api/1.0/roster', {
      success: function(data) {
        service.roster = data
        store.emitChange()
      }
    });
  },
  all: function() {
    return service.roster;
  }
}

export const store = assign({}, EventEmitter.prototype, {

  all: function() {
    return service.all();
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
})
