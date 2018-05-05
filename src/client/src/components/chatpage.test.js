import React from 'react';
import ReactDOM from 'react-dom';
import ChatPage from './chatpage'
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

configure({adapter: new Adapter()})

describe('<ChatPage />', () => {
  it('Should render without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ChatPage location={{state: {username: 'dummyUser'}}}/>, div);
    ReactDOM.unmountComponentAtNode(div);
  })
    
})