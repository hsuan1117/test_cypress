
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:21222',
        supportFile: false
    },
    video: false,
    screenshotOnRunFailure: false
})
