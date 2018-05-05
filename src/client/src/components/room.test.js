import React from 'react';
import ReactDOM from 'react-dom';
import Room from './room'
describe('<Room />', () => {
    it('renders Room component without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Room />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('renders Room component with parameters', () => {
        const div = document.createElement('div')
        ReactDOM.render(<Room name='dummyName' ID={123} onClick={() => {}}/>, div)
        ReactDOM.unmountComponentAtNode(div)
    })
})