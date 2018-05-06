import React from 'react';
import ReactDOM from 'react-dom';
import {shallow, mount, configure} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from '../../App';
import {BrowserRouter as Router, Route} from 'react-router'

configure({adapter: new Adapter()})

describe('<App />', () => {
  const wrapper = shallow(<App />)

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
})

