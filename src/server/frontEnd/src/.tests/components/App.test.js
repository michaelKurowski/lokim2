const React = require('react')
const {shallow, configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const App = require('../../App')

const EXPECTED_ELEMENTS_COUNT = 1
configure({adapter: new Adapter()})

describe('<App />', () => {
	const wrapper = shallow(<App />)

	it('renders without crashing', () => {
		const elementsCount = wrapper.render().length
		expect(elementsCount).toBe(EXPECTED_ELEMENTS_COUNT)
	})
})

