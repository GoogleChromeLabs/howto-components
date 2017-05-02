/* eslint max-len: ["off"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-checkbox', function() {
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
    return this.driver.get(`${this.address}/howto-checkbox/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-checkbox'));
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

describe('howto-checkbox pre-upgrade', function() {
  let success;

  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-checkbox/demo.html?nojs`);
  });

  it('should handle attributes set before upgrade',
    async function() {
      await this.driver.executeScript(_ =>
        window.expectedCheckbox = document.querySelector('howto-checkbox')
      );
      await this.driver.executeScript(_ =>
        window.expectedCheckbox.setAttribute('checked', '')
      );

      await this.driver.executeScript(_ => _loadJavaScript());
      await this.driver.executeScript(_ => customElements.whenDefined('howto-checkbox'));
      success = await this.driver.executeScript(_ =>
        window.expectedCheckbox.checked === true &&
        window.expectedCheckbox.getAttribute('aria-checked') === 'true'
      );
      expect(success).to.equal(true);
    }
  );

  it('should handle instance properties set before upgrade',
    async function() {
      await this.driver.executeScript(_ =>
        window.expectedCheckbox = document.querySelector('howto-checkbox')
      );
      await this.driver.executeScript(_ =>
        window.expectedCheckbox.checked = true
      );

      await this.driver.executeScript(_ => _loadJavaScript());
      await this.driver.executeScript(_ => customElements.whenDefined('howto-checkbox'));
      success = await this.driver.executeScript(_ =>
        window.expectedCheckbox.hasAttribute('checked') &&
        window.expectedCheckbox.getAttribute('aria-checked') === 'true'
      );
      expect(success).to.equal(true);
    }
  );
});
