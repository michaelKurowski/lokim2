const React = require('react')
const {configure, mount} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const App = require('theme/App')
const {Provider} = require('react-redux')
const initializeRedux = require('../../../initializeRedux')

configure({adapter: new Adapter()})

let suite
describe('<App />', () => {

	beforeEach(() => {
		suite = {
			store: initializeRedux() 
		}
		
	})

	it('renders without crashing', () => {
		const EXPECTED_ELEMENTS_COUNT = 1
		const element = mount(createApp(suite.store))
		const elementsCount = element.render().length
		expect(elementsCount).toBe(EXPECTED_ELEMENTS_COUNT)
	})

	it('lands on homepage by default', () => {
		const EXPECTED_ID = 'homepage'
		const element = mount(createApp(suite.store))
		const elementIdentifier = element.render().children()[0].attribs.id
		expect(elementIdentifier).toBe(EXPECTED_ID)
	})
})

function createApp(store) {
	return <Provider store={store}><App /></Provider>
}