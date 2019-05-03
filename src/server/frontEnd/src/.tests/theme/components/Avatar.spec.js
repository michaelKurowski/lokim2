const React = require('react')
const Avatar = require('theme/scenes/chatpage/components/Avatar/Avatar')
const renderer = require('react-test-renderer')

describe('Avatar Component', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<
            Avatar />
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
    it('Avatar icon renders correctly', () => {
        const tree = renderer.create(<
            Avatar src={`http://robohash.org/${this.props.username}`} />
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
    it('sizes Avatar renders correctly', () => {
        const tree = renderer.create(<
            Avatar height={this.handleSize(this.props.size)} />
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
}) 