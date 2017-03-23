const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('dash-checkbox', function() {
  let success;

  const findCheckbox = _ => {
    window.expectedCheckbox =
      document.querySelector('[role=checkbox]');
  };

  const isUnchecked = _ => {
    let isAriaUnchecked =
      !window.expectedCheckbox.hasAttribute('aria-checked') ||
      window.expectedCheckbox.getAttribute('aria-checked') === 'false';
    return isAriaUnchecked && window.expectedCheckbox.checked === false;
  };

  const isChecked = _ => {
    let isAriaChecked =
      window.expectedCheckbox.getAttribute('aria-checked') === 'true';
    return isAriaChecked && window.expectedCheckbox.checked === true;
  };

  beforeEach(function() {
    return this.driver.get(`${this.address}/dash-checkbox_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'dash-checkbox'));
  });

  it('should check the checkbox on [space]',
    async function() {
      await this.driver.executeScript(findCheckbox);
      success = await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedCheckbox
      );
      expect(success).to.equal(true);
      success = await this.driver.executeScript(isUnchecked);
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.SPACE).perform();
      success = await this.driver.executeScript(isChecked);
      expect(success).to.equal(true);
    }
  );

  it('should not be focusable when [disabled] is true',
    async function() {
      await this.driver.executeScript(findCheckbox);
      success = await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedCheckbox
      );
      expect(success).to.equal(true);
      success = await this.driver.executeScript(`
        window.expectedCheckbox.disabled = true;
        return document.activeElement != window.expectedCheckbox;
      `);
      expect(success).to.equal(true);
    }
  );

  it('should check the checkbox on click',
    async function() {
      await this.driver.executeScript(findCheckbox);
      success = await this.driver.executeScript(isUnchecked);
      expect(success).to.equal(true);
      await this.driver.findElement(By.css('[role=checkbox]')).click();
      success = await this.driver.executeScript(isChecked);
      expect(success).to.equal(true);
    }
  );
});
