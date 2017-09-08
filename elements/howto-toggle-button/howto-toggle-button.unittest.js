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

  describe('howto-toggle-button', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `<howto-toggle-button>Press me</howto-toggle-button>`;
      return howtoComponents.waitForElement('howto-toggle-button')
        .then(_ => {
          this.togglebutton = this.container.querySelector('howto-toggle-button');
        });
    });

    it('should add a [role] to the togglebutton', function() {
      expect(this.togglebutton.getAttribute('role')).to.equal('button');
    });

    it('should add a [tabindex] to the togglebutton', function() {
      expect(this.togglebutton.getAttribute('tabindex')).to.equal('0');
    });

    describe('pressed', function() {
      it('should toggle [pressed] and [aria-pressed] when calling ' +
        '_togglePressed()', function() {
          expect(this.togglebutton.pressed).to.be.false;
          this.togglebutton._togglePressed();
          expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('true');
          expect(this.togglebutton.pressed).to.be.true;
        });

      it('should toggle [pressed] and [aria-pressed] when setting .pressed', function() {
        expect(this.togglebutton.pressed).to.be.false;
        this.togglebutton.pressed = true;
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('true');
        expect(this.togglebutton.pressed).to.be.true;
        this.togglebutton.pressed = false;
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('false');
        expect(this.togglebutton.pressed).to.be.false;
      });

      it('should handle truthy/falsy values for .pressed', function() {
        expect(this.togglebutton.pressed).to.be.false;
        this.togglebutton.pressed = '0';
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('true');
        expect(this.togglebutton.hasAttribute('pressed')).to.be.true;
        expect(this.togglebutton.pressed).to.be.true;
        this.togglebutton.pressed = undefined;
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('false');
        expect(this.togglebutton.hasAttribute('pressed')).to.be.false;
        expect(this.togglebutton.pressed).to.be.false;
        this.togglebutton.pressed = 1;
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('true');
        expect(this.togglebutton.hasAttribute('pressed')).to.be.true;
        expect(this.togglebutton.pressed).to.be.true;
      });

      it('should toggle .pressed, [aria-pressed] when setting [pressed]', function() {
        expect(this.togglebutton.hasAttribute('pressed')).to.be.false;
        this.togglebutton.setAttribute('pressed', '');
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('true');
        expect(this.togglebutton.pressed).to.be.true;
        this.togglebutton.removeAttribute('pressed');
        expect(this.togglebutton.getAttribute('aria-pressed')).to.equal('false');
        expect(this.togglebutton.pressed).to.be.false;
      });
    });

    describe('disabled', function() {
      it('should toggle [disabled], [aria-disabled], and [tabindex] when setting .disabled', function() {
        expect(this.togglebutton.disabled).to.be.false;
        this.togglebutton.disabled = true;
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('true');
        expect(this.togglebutton.hasAttribute('tabindex')).to.be.false;
        expect(this.togglebutton.disabled).to.be.true;
        this.togglebutton.disabled = false;
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('false');
        expect(this.togglebutton.getAttribute('tabindex')).to.equal('0');
        expect(this.togglebutton.disabled).to.be.false;
      });

      it('should handle truthy/falsy values for .disabled', function() {
        expect(this.togglebutton.disabled).to.be.false;
        this.togglebutton.disabled = '0';
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('true');
        expect(this.togglebutton.hasAttribute('disabled')).to.be.true;
        expect(this.togglebutton.disabled).to.be.true;
        this.togglebutton.disabled = undefined;
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('false');
        expect(this.togglebutton.hasAttribute('disabled')).to.be.false;
        expect(this.togglebutton.disabled).to.be.false;
        this.togglebutton.disabled = 1;
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('true');
        expect(this.togglebutton.hasAttribute('disabled')).to.be.true;
        expect(this.togglebutton.disabled).to.be.true;
      });

      it('should toggle .disabled, [aria-disabled] when setting [disabled]', function() {
        expect(this.togglebutton.hasAttribute('disabled')).to.be.false;
        this.togglebutton.setAttribute('disabled', '');
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('true');
        expect(this.togglebutton.disabled).to.be.true;
        this.togglebutton.removeAttribute('disabled');
        expect(this.togglebutton.getAttribute('aria-disabled')).to.equal('false');
        expect(this.togglebutton.disabled).to.be.false;
      });
    });
  });
})();
