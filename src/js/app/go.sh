browserify markt --standalone appLink > appLink.js
(echo "/* eslint-disable */\n" && cat appLink.js) > revised && mv revised appLink.js