const React = require('react')
const {configure, shallow} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const AvatarComponent = require('../../../theme/components/icon/icon')

configure({ adapter: new Adapter() })
describe('<Icon />', () => {
	it('correct icon render', () => {
		const wrapper = shallow(<AvatarComponent size='48' icon='logo' />)
		expect(wrapper).toMatchSnapshot()
	})
})