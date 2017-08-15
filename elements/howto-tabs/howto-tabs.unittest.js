/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint max-len: ["off"] */

(function() {
const expect = chai.expect;

describe('howto-tabs', function() {
  before(howtoComponents.before());
  after(howtoComponents.after());
  beforeEach(function() {
    this.container.innerHTML = `
      <howto-tabs>
        <howto-tab role="heading">Tab 1</howto-tab >
        <howto-panel role="region">Content 1</howto-panel>
        <howto-tab  role="heading">Tab 2</howto-tab >
        <howto-panel role="region">Content 2</howto-panel>
        <howto-tab  role="heading">Tab 3</howto-tab >
        <howto-panel role="region">Content 3</howto-panel>
      </howto-tabs>
    `;
    return Promise.all([
      howtoComponents.waitForElement('howto-tabs'),
      howtoComponents.waitForElement('howto-tab'),
      howtoComponents.waitForElement('howto-panel'),
    ]).then(_ => {
      this.tabpanel = this.container.querySelector('howto-tabs');
      this.tabs = Array.from(this.container.querySelectorAll('howto-tab'));
      this.panels = Array.from(this.container.querySelectorAll('howto-panel'));
    });
  });

  it('should know about all the tabs', function() {
    expect(this.tabpanel._allTabs()).to.have.length(this.container.querySelectorAll('howto-tab ').length);
  });

  it('should know about all the panels', function() {
    expect(this.tabpanel._allPanels()).to.have.length(this.container.querySelectorAll('howto-panel').length);
  });

  it('should add `aria-labelledby` to panels', function() {
    this.panels.forEach(panel => expect(panel.getAttribute('aria-labelledby')).to.have.length.above(0));
  });

  it('should add `role` to panels', function() {
    this.panels.forEach(panel => expect(panel.getAttribute('role')).to.equal('tabpanel'));
  });

  it('should upgrade `role` of tabs', function() {
    this.tabs.forEach(panel => expect(panel.getAttribute('role')).to.equal('tab'));
  });

  it('should only have one visible panel initially', function() {
    expect(this.panels.filter(panel => !howtoComponents.isHidden(panel))).to.have.lengthOf(1);
  });

  it('should have one selected tab initially', function() {
    expect(this.tabs.filter(
        tab => tab.getAttribute('aria-selected') === 'true'
    )).to.have.lengthOf(1);
  });

  it('should switch visibility when calling `_selectTab()`', function() {
    const selectedTab = this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    const selectedPanel = this.panels.find(panel => panel.id === selectedTab.getAttribute('aria-controls'));
    const otherTab = this.tabs.find(tab => tab !== selectedTab);
    const otherPanel = this.panels.find(panel => panel.id === otherTab.getAttribute('aria-controls'));

    expect(otherTab.getAttribute('aria-selected')).to.equal('false');
    expect(howtoComponents.isHidden(otherPanel)).to.be.true;
    this.tabpanel._selectTab(otherTab);
    expect(otherTab.getAttribute('aria-selected')).to.equal('true');
    expect(howtoComponents.isHidden(otherPanel)).to.be.false;
    expect(selectedTab.getAttribute('aria-selected')).to.equal('false');
    expect(howtoComponents.isHidden(selectedPanel)).to.be.true;
  });
});
})();
