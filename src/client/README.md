# Lokim's Front End Codebase

This client uses ReactJS and React Router as the main framework

### Things to note include: 
- Frontend must be proxied to server port via package.json to avoid CORS issues in development. This is because Create-React-App uses webpack which launches a local development server on port 3000
- To launch the app, run npm start in /src/client, and npm start in /src/server
- Sockets are buggy at the moment, if you are seemingly disconnected after login, just refresh the page.

### To Do List
- Remove comments
- Remove console.logs
- Add more support for config file/env variables
- Add messages to localStorage in chatPage so that setState is not called unnecessarily when the user receives a message in a "background" chat.
- Blacklist dupadupa as a password
- Make the CSS more cross-browser friendly
- Fix odd bugginess of sockets