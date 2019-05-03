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
            Avatar src={`http://robohash.org/Damian`} />
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
    it('sizes Avatar renders correctly', () => {
        const tree = renderer.create(<
            Avatar height={'small'} />
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
}) 