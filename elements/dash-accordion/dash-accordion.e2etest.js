const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('dash-accordion', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/dash-accordion_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'dash-accordion'));
  });

  it('should focus the next heading on [arrow right]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'heading';`
        );
      expect(found).to.equal(true);

      await this.driver
        .executeScript(`window.firstHeading = document.activeElement;`);
      await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
      const focusedSomeTab = await this.driver.executeScript(`
        return window.firstHeading !== document.activeElement &&
          document.activeElement.getAttribute('role') === 'heading';
      `);
      expect(focusedSomeTab).to.equal(true);
    }
  );

//   it('should focus the prev tab on [arrow left]',
//     async function() {
//       const found =
//         await helper.pressKeyUntil(
//           this.driver,
//           Key.TAB,
//           `return document.activeElement.getAttribute('role') === 'tab';`
//         );
//       expect(found).to.equal(true);

//       await this.driver
//         .executeScript(`window.firstTab = document.activeElement;`);
//       await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
//       const focusedAnotherTab = await this.driver.executeScript(`
//         return window.firstTab !== document.activeElement &&
//           document.activeElement.getAttribute('role') === 'tab';
//       `);
//       expect(focusedAnotherTab).to.equal(true);
//     }
//   );

//   it('should focus the last tab on [end]',
//     async function() {
//       const found =
//         await helper.pressKeyUntil(
//           this.driver,
//           Key.TAB,
//           `return document.activeElement.getAttribute('role') === 'tab';`
//         );
//       expect(found).to.equal(true);
//       await this.driver
//         .executeScript(`window.firstTab = document.activeElement;`);

//       await this.driver.actions().sendKeys(Key.END).perform();
//       const focusedSomeTab = await this.driver.executeScript(`
//         return window.firstTab !== document.activeElement &&
//           document.activeElement.getAttribute('role') === 'tab';
//       `);
//       expect(focusedSomeTab).to.equal(true);

//       await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
//       const nextTabWasFirstTab = await this.driver.executeScript(`
//         return window.firstTab === document.activeElement;
//       `);
//       expect(nextTabWasFirstTab).to.equal(true);
//     }
//   );

//   it('should focus the first tab on [home]',
//     async function() {
//       const found =
//         await helper.pressKeyUntil(
//           this.driver,
//           Key.TAB,
//           `return document.activeElement.getAttribute('role') === 'tab';`
//         );
//       expect(found).to.equal(true);
//       await this.driver
//         .executeScript(`window.firstTab = document.activeElement;`);

//       await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
//       await this.driver.actions().sendKeys(Key.HOME).perform();
//       const focusedSomeTab = await this.driver.executeScript(`
//         return window.firstTab === document.activeElement;
//       `);
//       expect(focusedSomeTab).to.equal(true);
//     }
//   );

 it('should focus a tab on click',
    async function() {
      const lastHeading =
        await this.driver.findElement(By.css('[role=heading]:last-of-type'));
      const lastPanelId = await lastHeading.getAttribute('aria-controls');
      const lastPanel = await this.driver.findElement(By.id(lastPanelId));
      expect(lastHeading.getAttribute('aria-expanded')).to.not.equal('true');
      await lastHeading.click();
      expect(await lastHeading.getAttribute('aria-expanded')).to.equal('true');
      expect(await lastPanel.getAttribute('aria-hidden')).to.contain('false');
    }
  );
});
