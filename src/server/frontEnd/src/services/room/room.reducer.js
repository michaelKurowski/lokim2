const ACTION_CODES = require('./room.actions').CODES

const initialState = {
    members: [],
    messages: []
}

const handleActions = (state = initialState, action = {}) => {
    switch (action.type) {
        case ACTION_CODES.ADD_MEMBER:
            const currentMembers = state.members
            return Object.assign({}, state,
                {members: [action.payload.username, ...currentMembers]}
            )
        default:
            return state
    }
}

module.exports = handleActions