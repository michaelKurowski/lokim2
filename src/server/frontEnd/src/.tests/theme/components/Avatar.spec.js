const React = require('react')
const {configure, shallow} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const AvatarComponent = require('../../../theme/components/avatar/avatar')

let suite = {}
configure({ adapter: new Adapter() })
describe('<Avatar />', ()=>{
    it.only('correct avatar render', ()=>{
        const wrapper = shallow(<AvatarComponent size='48' username='rick' />)
        expect(wrapper).toMatchSnapshot()
    })

})