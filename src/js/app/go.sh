browserify markt -o app.js
browserify markt --standalone appLink > appLink.js
(echo "/* eslint-disable */" && cat appLink.js) > revised && mv revised appLink.js