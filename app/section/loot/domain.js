import keyMirror from 'keymirror'
import assign from 'object-assign'

import Dispatcher from './../../dispatcher.es6'

import EventEmitter from 'events'

const CHANGE_EVENT = 'change';

const actionKeys = keyMirror({
  TOGGLE: null
});

export const actions = {
  toggle: function(itemHash) {

    Dispatcher.handleAction({
      actionType: actionKeys.TOGGLE,
      data: itemHash
    })
  }
}

Dispatcher.register(function(event) {
  switch(event.action.actionType) {
    case actionKeys.TOGGLE:

      console.log('acton dispatch')

      service.toggle(event.action.data)

      break;

    default:
      return false;
  }

  store.emitChange()
})

const service = {
  all: function() {
    try {
      let ticked = JSON.parse(localStorage.getItem('loot.ticked'));

      if (!Array.isArray(ticked)) {
        throw 'not array'
      }

      return ticked;

    } catch(err) {
      return []
    }
  },

  save: function(ticked) {
    localStorage.setItem('loot.ticked', JSON.stringify(ticked.filter((value, index, self) => {
      return self.indexOf(value) === index;
    })))
  },

  toggle: function(hash) {
    let ticked = service.all()

    if (ticked.indexOf(hash) < 0) {
      service.push(hash)
    } else {
      service.pop(hash)
    }
  },

  push: function(hash) {
    let ticked = service.all()

    ticked.push(hash)

    service.save(ticked)
  },

  pop: function(hash) {
    let ticked = service.all()

    let index = ticked.indexOf(hash)

    if (index < 0) {
      return;
    }
    ticked.splice( index, 1 );
    service.save(ticked)
  }
}

export const store = assign({}, EventEmitter.prototype, {

  getTicked: function() {
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
