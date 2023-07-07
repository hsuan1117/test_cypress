const fs = require('fs')
const {chdir} = require('process')
const {exec} = require("child_process");
const cypress = require('cypress')
const port = 21222

chdir('/app')

const config = `
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:${port}',
        supportFile: false
    },
    video: false,
    screenshotOnRunFailure: false
})
`
fs.writeFileSync('cypress.config.js', config)

const code = `
describe("run.test.js", () => {
    it('Test row exist', () => {
        cy.visit('index.html')
        cy.get('.row').should('have.length', 1)
    })
})
`
if (!fs.existsSync('cypress/e2e')) {
    fs.mkdirSync('cypress/e2e', {recursive: true})
}
fs.writeFileSync('cypress/e2e/run.cy.js', code)

const reporter_code = `
const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

class MyReporter {
  constructor(runner) {
  }
}

module.exports = MyReporter;
`
fs.writeFileSync('reporter.js', reporter_code)
exec(`http-server -c-1 --silent --port=${port} &`)
exec(`wait-on tcp:${port}`, (err, stdout, stderr) => {
    cypress.run({
        config: {
            video: false,
            screenshotOnRunFailure: false
        },
        quiet: true,
        reporter: 'reporter.js',
    }).then((results) => {
        exec(`kill $(lsof -t -i:${port})`, (err, stdout, stderr) => {
            process.exit(0)
        })
        if (results.totalFailed > 0) {
            console.log({
                status: 'WA',
                ...results
            })
            process.exit(0)
        }
        console.log({
            status: 'AC',
            ...results
        })
        process.exit(0)
    })
})
