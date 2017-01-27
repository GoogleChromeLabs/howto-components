module.exports = {
  /**
   * `pressKeyUntil` sends a key presses to the page until the script
   * evaluates to true. A maximum of `maxPresses` key presses will be sent.
   * @returns `true` if the condition was met. `false` otherwise.
   */
  pressKeyUntil: async (driver, key, script, maxPresses = 100) => {
    // Tab through the page until the focused element matches selector.
    let found = false;
    for(let i = 0; i < maxPresses; i++) {
      found = await driver.executeScript(script);
      if (found)
        break;
      // Press tab to advance to next element.
      await driver.actions()
        .sendKeys(key)
        .perform();
    }
    return found;
  },
};
