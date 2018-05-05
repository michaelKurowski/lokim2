import React from 'react';
import ReactDOM from 'react-dom';
import Register from './register'

it('renders register component without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Register />, div);
    ReactDOM.unmountComponentAtNode(div);
});

