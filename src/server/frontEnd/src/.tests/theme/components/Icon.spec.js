const React = require('react')
const Icon = require('theme/components/Icon/Icon')
const renderer = require('react-test-renderer')

describe('Icon Component', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<
            Icon />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it('logo icon renders correctly', () => {
        const tree = renderer.create(<
            Icon src={"logo"} />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it('sizes icon renders correctly', () => {
        const tree = renderer.create(<
            Icon height={"big"} />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });
})