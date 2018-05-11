const React = require('react')
const {mount, configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const App = require('../../App')

const ONE_ELEMENT = 1
configure({adapter: new Adapter()})

describe('<App />', () => {
	const wrapper = mount(<App />)

	it('renders without crashing', () => {
		expect(wrapper.find(App).length).toBe(ONE_ELEMENT)
	})
})

