const React = require('react')
const {configure, shallow} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const IconComponent = require('../../../theme/components/icon/icon')

configure({ adapter: new Adapter() })
describe('<Icon />', () => {
	it('correct icon render', () => {
		const wrapper = shallow(<IconComponent size='48' icon='logo' />)
		expect(wrapper).toMatchSnapshot()
	})
})