const http = require('http');
const fs = require('mz/fs');
const express = require('express');
const seleniumAssistant = require('selenium-assistant');

function browserFilter(browser) {
  return browser.getReleaseName() === 'stable'
    && ['chrome'].includes(browser.getId());
}

function startServer() {
  return new Promise(resolve => {
    const app = express();
    app.use(express.static('docs'));
    const server = http.createServer(app).listen();
    server.on('listening', _ => resolve(server));
  });
}

async function loadTestSuites() {
  const elements = await fs.readdir('elements');
  const filteredElements = await Promise.all(
    elements.map(async element => {
      const files = await fs.readdir(`elements/${element}/`);
      if (files.some(f => /\.e2etest\.js/.test(f)))
        return element;
      else
        return '';
    })
  );
  return filteredElements
    .filter(name => !!name)
    .map(name => ({
      name,
      suite: require(`./elements/${name}/${name}.e2etest`),
    }));
}

async function main() {
  // * Start a webserver to serve the docs so we can run the e2e tests on the
  // demos.
  // * require() all test suites.
  // * Open all stable browsers and get their webdriver.
  const [server, testSuites, ...drivers] =
    await Promise.all([
      startServer(),
      loadTestSuites(),
      ...seleniumAssistant.getLocalBrowsers()
        .filter(browserFilter)
        .map(b => b.getSeleniumDriver()),
    ]);

  // We let the OS choose the port, so we assemble the URL here
  const address = `http://localhost:${server.address().port}`;

  let err = null;
  try {
    const test = await runTests(address, testSuites, drivers);
    if (test && test.error)
      err = `Error: "${test.testSuite.name} ${test.name}"` +
        ` in ???: ${test.error}`;
  } catch (e) {
    err = e.stack;
  }

  console.log('Killing all browser instances...');
  await Promise.all(
    drivers.map(driver => seleniumAssistant.killWebDriver(driver))
  );
  server.close();
  console.log('Done.');
  return err;
}

async function runTests(address, testSuites, drivers) {
  for (let testSuite of testSuites) {
    console.log(`Running test suite for ${testSuite.name}...`);
    console.log(`Navigate all browsers to the demo page...`);
    await Promise.all(
      drivers.map(
        driver => driver.get(`${address}/${testSuite.name}_demo.html`)
      )
    );
    console.log('Navigation done.');
    for (let test of Object.entries(testSuite.suite)) {
      console.log(`Running test "${testSuite.name} ${test[0]}"...`);
      const results = await Promise.all(
        drivers.map(async driver => {
          const error = await test[1](driver);
          return {driver, testSuite, name: test[0], error};
        })
      );
      const failedTest = results.find(r => !!r.error);
      if (failedTest) {
        return failedTest;
      } else {
        console.log(`Done with "${testSuite.name} ${test[0]}"`);
      }
    }
  }
}

main()
  .then(err => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log('e2e tests done.');
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });

//   return Promise.all([
//     server,
//     ...browsers.map(async browser => {
//         await browser.get(address);
//         const header = await browser.findElement(By.css('h1'));
//         const text = await header.getText();
//         console.log(`${browser._id}: ${text}`);
//         return browser;
//       }),
//   ]);
// })
// .then(([server, ...browsers]) => Promise.all([
//   server.close(),
//   browsers.map(browser => seleniumAssistant.killWebDriver(browser)),
// ]))
