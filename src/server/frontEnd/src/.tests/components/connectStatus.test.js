const React = require('react')
const ConnectStatus = require('../../components/connectStatus')
const { shallow, configure } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

const DISCONNECT = '.disconnect'
const SUCCESS = '.success'
const EXPECTED_ELEMENT_COUNT = 1
let suite = {}
configure({adapter: new Adapter()})

describe('<ConnectionStatus />', () => {
	beforeEach(() => {
		suite.wrapper = shallow(<ConnectStatus />)
	})
	afterEach(() => {
		suite = {}
	})
	it('Should render without crashing', () => {
		const elementsCount = suite.wrapper.render().length
		expect(elementsCount).toBe(EXPECTED_ELEMENT_COUNT)
	})
	it('Should return disconnected with falsey prop', () => {
		suite.wrapper = shallow(<ConnectStatus connection={false}/>)
		expect(suite.wrapper.find(DISCONNECT).length).toBe(EXPECTED_ELEMENT_COUNT)
	})
	it('Should return disconnected with no prop', () => {
		expect(suite.wrapper.find(DISCONNECT).length).toBe(EXPECTED_ELEMENT_COUNT)
	})
	it('Should return connected with truthy prop', () => {
		suite.wrapper = shallow(<ConnectStatus connection={true}/>)
		expect(suite.wrapper.find(SUCCESS).length).toBe(EXPECTED_ELEMENT_COUNT)
	})
})