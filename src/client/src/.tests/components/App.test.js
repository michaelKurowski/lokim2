import React from 'react';
import {mount, configure} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from '../../App';

const ONE_ELEMENT = 1
configure({adapter: new Adapter()})

describe('<App />', () => {
  const wrapper = mount(<App />)

  it('renders without crashing', () => {
   expect(wrapper.find(App).length).toBe(ONE_ELEMENT)
  });
})

