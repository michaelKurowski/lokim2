const React = require('react')
const {mount, configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const {MemoryRouter} = require('react-router-dom')

const REGISTER_URL = require('routing-config').paths.REGISTER

const RegisterPage = require('theme/scenes/register/register')

configure({adapter: new Adapter()})

let suite
describe('<Register />', () => {
    beforeEach(() => {
        const REGISTER_PAGE_COMPONENT = 
            <MemoryRouter initialEntries={[REGISTER_URL]}>
                <RegisterPage />
            </MemoryRouter>

        suite = {
            wrapper: REGISTER_PAGE_COMPONENT
        }
    })

    it('renders without errors', () => {
        mount(suite.wrapper)
    })
})