const helper = require('../../tools/selenium-helper.js');
const Key = require('selenium-webdriver').Key;

module.exports = {
  'should focus the next element on [arrow right]': async function(driver) {
    const found =
      await helper.pressKeyUntil(
        driver,
        Key.TAB,
        `return document.activeElement.getAttribute('aria-role') === 'tab';`
      );
    if (!found)
      return 'Could not find header element by tabbing';

    await driver.executeScript(`window.firstTab = document.activeElement;`);
    await driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    const rightFocus = await driver.executeScript(`
      return window.firstTab.nextElementSibling === document.activeElement;
    `);
    if (!rightFocus)
      return 'Sibling of first tab wasn’t focused after pressing [arrow-right]';
  },
};
