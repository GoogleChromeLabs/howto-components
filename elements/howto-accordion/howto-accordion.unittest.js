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

  describe('howto-accordion', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `
        <howto-accordion>
          <howto-accordion-heading id="lol"><button>Tab 1</button></howto-accordion-heading>
          <howto-accordion-panel>Content 1</howto-accordion-panel>
          <howto-accordion-heading><button>Tab 2</button></howto-accordion-heading>
          <howto-accordion-panel>Content 2</howto-accordion-panel>
          <howto-accordion-heading><button>Tab 3</button></howto-accordion-heading>
          <howto-accordion-panel>Content 3</howto-accordion-panel>
        </howto-accordion>
      `;
      return Promise.all([
        howtoComponents.waitForElement('howto-accordion'),
        howtoComponents.waitForElement('howto-accordion-heading'),
        howtoComponents.waitForElement('howto-accordion-panel'),
      ]).then(_ => {
        this.accordion = this.container.querySelector('howto-accordion');
        this.headings = Array.from(this.container.querySelectorAll('howto-accordion-heading'));
        this.panels = Array.from(this.container.querySelectorAll('howto-accordion-panel'));
      });
    });

    it('should know about all the headings', function() {
      expect(this.accordion._allHeadings()).to.have.length(this.headings.length);
    });

    it('should’t overwrite existing IDs with generated ones', function() {
      expect(this.headings[0].id).to.equal('lol');
      expect(this.panels[0].getAttribute('aria-labelledby')).to.equal('lol');
    });

    it('should know about all the panels', function() {
      expect(this.accordion._allPanels()).to.have.length(this.panels.length);
    });

    it('should add `aria-labelledby` to panels', function() {
      this.panels.forEach(panel => {
        expect(panel.getAttribute('aria-labelledby')).to.have.length.above(0);
      });
    });

    it('should ensure IDs to all headings', function() {
      this.headings.forEach(heading => {
        expect(heading.id).to.have.length.above(0);
      });
    });

    it('should add `role` to panels', function() {
      this.panels.forEach(panel => {
        expect(panel.getAttribute('role')).to.equal('region');
      });
    });
  });
})();
