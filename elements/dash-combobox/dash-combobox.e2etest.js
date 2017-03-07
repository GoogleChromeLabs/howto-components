const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {By} = require('selenium-webdriver');

describe('dash-combobox', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/dash-combobox_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'dash-combobox'));
  });

  it('should be a thing',
    async function() {
      const _ =
        await this.driver.findElement(By.css('[role=combobox]:last-of-type'));
      _.toString();
      expect(true).to.equal(true);
    }
  );
});
