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

  describe('howto-label', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());

    describe('no target', function() {
      beforeEach(async function() {
        this.container.innerHTML = `
          <howto-label>
            Click Me
          </howto-label>
        `;
        await howtoComponents.waitForElement('howto-label');
        this.label = this.container.querySelector('howto-label');
        return Promise.resolve();
      });

      it('should have a generated id', function() {
        expect(this.label.id).to.contain('howto-label-generated-0');
      });

      it('should not have a for value', function() {
        expect(this.label.for).to.equal('');
      });
    });

    describe('explicit [for]', function() {
      beforeEach(function() {
        this.container.innerHTML = `
          <howto-label for="foo">
            Click Me
          </howto-label>
          <howto-checkbox id="foo"></howto-checkbox>
        `;
        this.label = this.container.querySelector('howto-label');
        this.checkbox = this.container.querySelector('howto-checkbox');
        return Promise.resolve();
      });

      it('should return the correct value for the for property', function() {
        expect(this.label.for).to.equal('foo');
      });

      it('should apply a [aria-labelledby] to the target', function() {
        expect(this.checkbox.getAttribute('aria-labelledby'))
          .to.equal(this.label.getAttribute('id'));
      });
    });

    describe('implicit [for]', function() {
      beforeEach(function() {
        this.container.innerHTML = `
          <howto-label>
            Click Me Too
            <howto-checkbox></howto-checkbox>
          </howto-label>
        `;
        this.label = this.container.querySelector('howto-label');
        this.checkbox = this.container.querySelector('howto-checkbox');
        return Promise.resolve();
      });

      it('should self apply a [id]', function() {
        expect(this.label.hasAttribute('id')).to.equal(true);
      });

      it('should apply a [aria-labelledby] to the target', function() {
        let target = this.label.firstElementChild;
        expect(this.checkbox).to.equal(target);
        expect(this.checkbox.hasAttribute('aria-labelledby')).to.equal(true);
        expect(this.checkbox.getAttribute('aria-labelledby'))
          .to.equal(this.label.getAttribute('id'));
      });
    });

    describe('nested children, explicit target', function() {
      beforeEach(function() {
        this.container.innerHTML = `
          <howto-label>
            <strong>Click Me Last</strong>
            <howto-checkbox howto-label-target></howto-checkbox>
          </howto-label>
        `;
        this.label = this.container.querySelector('howto-label');
        this.checkbox = this.container.querySelector('howto-checkbox');
        return Promise.resolve();
      });

      it('should self apply a [id]', function() {
        expect(this.label.hasAttribute('id')).to.equal(true);
      });

      it('should apply a [aria-labelledby] to the target', function() {
        let target = this.container.querySelector('[howto-label-target]');
        expect(this.checkbox).to.equal(target);
        expect(this.checkbox.hasAttribute('aria-labelledby')).to.equal(true);
        expect(this.checkbox.getAttribute('aria-labelledby'))
          .to.equal(this.label.getAttribute('id'));
      });
    });
  });
})();
