const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-tree', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-tree/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-tree'));
  });

  // FIXME: This test is acting flakey
  it('should make the first tree-item the activedescendant on focus',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const tree =
        await this.driver.findElement(By.css('howto-tree'));
      const activeDescendant = await tree.getAttribute('aria-activedescendant');
      const firstTreeItem = await this.driver
        .findElement(By.css('howto-tree-item'))
        .getAttribute('id');
      expect(activeDescendant).to.equal(firstTreeItem);
    }
  );

  it('should make the next tree-item the activedescendant on [arrow down]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      const tree =
        await this.driver.findElement(By.css('howto-tree'));
      const activeDescendant = await tree.getAttribute('aria-activedescendant');
      const secondTreeItem = await this.driver
        .findElement(By.css('howto-tree-item:nth-of-type(2)'))
        .getAttribute('id');
      expect(activeDescendant).to.equal(secondTreeItem);
    }
  );

  it('should make the previous tree-item the activedescendant on [arrow up]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
      const tree =
        await this.driver.findElement(By.css('howto-tree'));
      const activeDescendant = await tree.getAttribute('aria-activedescendant');
      const firstTreeItem = await this.driver
        .findElement(By.css('howto-tree-item:first-of-type'))
        .getAttribute('id');
      expect(activeDescendant).to.equal(firstTreeItem);
    }
  );

  it('should expand parent tree-items on [arrow right]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const parentTreeItem = await this.driver
        .executeScript(`
          return Array.from(document.querySelectorAll('[role=treeitem]'))
            .find(item => item.children.length > 0);
        `);
      const parentTreeItemID = await parentTreeItem.getAttribute('id');
      await helper.pressKeyUntil(
        this.driver,
        Key.ARROW_DOWN,
        `return document.activeElement
          .getAttribute('aria-activedescendant') === '${parentTreeItemID}';`
      );
      await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('true');
    }
  );

  it('should collapse parent tree-items on [arrow left]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const parentTreeItem = await this.driver
        .executeScript(`
          return Array.from(document.querySelectorAll('[role=treeitem]'))
            .find(item => item.children.length > 0);
        `);
      const parentTreeItemID = await parentTreeItem.getAttribute('id');
      await helper.pressKeyUntil(
        this.driver,
        Key.ARROW_DOWN,
        `return document.activeElement
          .getAttribute('aria-activedescendant') === '${parentTreeItemID}';`
      );
      await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('true');
      await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
      // TODO: This could also just be null and still be acceptable
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('false');
    }
  );

  it('should make the first visible tree-item the activedescendant on [home]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
      await this.driver.actions().sendKeys(Key.HOME).perform();
      const tree =
        await this.driver.findElement(By.css('howto-tree'));
      const activeDescendant = await tree.getAttribute('aria-activedescendant');
      const firstTreeItem = await this.driver
        .findElement(By.css('howto-tree-item'))
        .getAttribute('id');
      expect(activeDescendant).to.equal(firstTreeItem);
    }
  );

  it('should make the last visible tree-item the activedescendant on [end]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const lastVisibleTreeItem = await this.driver
        .executeScript(`
          const treeItems = [];
          function findTreeItems(node) {
            for (let el of node.children) {
              if (el.getAttribute('role') === 'treeitem') treeItems.push(el);
              if (el.getAttribute('role') === 'treeitem' &&
                  el.getAttribute('aria-expanded') !== 'true') continue;
              findTreeItems(el);
            }
          }
          findTreeItems(document.activeElement);
          return treeItems[treeItems.length - 1];
        `);

      await this.driver.actions().sendKeys(Key.END).perform();
      const tree =
        await this.driver.findElement(By.css('howto-tree'));
      const activeDescendant = await tree.getAttribute('aria-activedescendant');
      expect(activeDescendant)
        .to.equal(await lastVisibleTreeItem.getAttribute('id'));
    }
  );

  it('should select an item on [space]',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const firstTreeItem = await this.driver
        .findElement(By.css('howto-tree-item'));
      await this.driver.actions().sendKeys(Key.SPACE).perform();
      expect(await firstTreeItem.getAttribute('aria-selected'))
        .to.equal('true');
    }
  );

  it('should select and expand parent tree-items on click',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      const parentTreeItem = await this.driver
        .executeScript(`
          return Array.from(document.querySelectorAll('[role=treeitem]'))
            .find(item => item.children.length > 0);
        `);
      await parentTreeItem.click();
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('true');
      expect(await parentTreeItem.getAttribute('aria-selected'))
        .to.equal('true');
    }
  );

  it('should collapse expanded parent tree-items on click',
    async function() {
      const found =
        await helper.pressKeyUntil(
          this.driver,
          Key.TAB,
          `return document.activeElement.getAttribute('role') === 'tree';`
        );
      expect(found).to.equal(true);

      let parentTreeItem = await this.driver
        .executeScript(`
          return document.querySelector('howto-tree-item-group');
        `);
      let parentTreeItemLabel = await this.driver
        .executeScript(`
          return document.querySelector('howto-tree-item-group > label');
        `);
      await parentTreeItemLabel.click();
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('true');
      await parentTreeItemLabel.click();
      expect(await parentTreeItem.getAttribute('aria-expanded'))
        .to.equal('false');
    }
  );
});
