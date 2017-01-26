const http = require('http');
const express = require('express');
const seleniumAssistant = require('selenium-assistant');
const selenium = require('selenium-webdriver');
const By = selenium.By;

function startServer() {
  return new Promise(resolve => {
    const app = express();
    app.use(express.static('docs'));
    const server = http.createServer(app).listen();
    server.on('listening', _ => resolve(server));
  });
}

const browsers = seleniumAssistant.getLocalBrowsers();
Promise.all([
    startServer(),
    ...browsers
      .filter(b => b.getReleaseName() === 'stable')
      .map(browser => {
        console.log(`Starting tests in ${browser.getPrettyName()}...`);
        return browser.getSeleniumDriver();
      }),
])
.then(([server, ...browsers]) => {
  const address = `http://localhost:${server.address().port}`;
  return Promise.all([
    server,
    ...browsers.
      map(browser =>
        browser.get(address)
          .then(_ => browser.findElement(By.css('h1')))
          .then(e => e.getText())
          .then(t => console.log(t))
          .then(_ => browser)
      ),
  ]);
})
.then(([server, ...browsers]) => Promise.all([
  server.close(),
  browsers.map(browser => seleniumAssistant.killWebDriver(browser)),
]))
.then(_ => console.log('Done.'))
.catch(err => console.error(err.stack));
