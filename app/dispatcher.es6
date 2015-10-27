import { Dispatcher as FluxDispatcher } from 'flux'

class Dispatcher extends FluxDispatcher {
  constructor(...args) {
    super(...args)
  }

  handleAction(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      action: action
    });
  }
}

const AppDispatcher = new Dispatcher();
console.log('instantiated', AppDispatcher)
export default AppDispatcher;
