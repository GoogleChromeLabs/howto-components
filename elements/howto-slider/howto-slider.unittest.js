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

  describe('howto-slider', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `<howto-slider></howto-slider>`;
      return howtoComponents.waitForElement('howto-slider')
        .then(_ => {
          this.slider = this.container.querySelector('howto-slider');
        });
    });

    it('should add a [role] to the slider', function() {
      expect(this.slider.getAttribute('role')).to.equal('slider');
    });

    it('should add a [tabindex] to the slider', function() {
      expect(this.slider.getAttribute('tabindex')).to.equal('0');
    });

    it('should add a [aria-valuenow] to the slider', function() {
      expect(this.slider.getAttribute('aria-valuenow')).to.equal('0');
    });

    it('should add a [aria-valuemax] to the slider', function() {
      expect(this.slider.getAttribute('aria-valuemax')).to.equal('100');
    });

    it('should add a [aria-valuemin] to the slider', function() {
      expect(this.slider.getAttribute('aria-valuemin')).to.equal('0');
    });

    describe('value', function() {
      it('should set [value] and [valuenow] when calling ' +
        '_changeValue(value)', function() {
          expect(this.slider.value).to.equal(0);
          this.slider._changeValue(10);
          expect(this.slider.getAttribute('aria-valuenow')).to.equal('10');
          expect(this.slider.value).to.equal(10);
      });

      it('should set [value] and [valuenow] when setting .value', function() {
        expect(this.slider.value).to.equal(0);
        this.slider.value = 10;
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('10');
        expect(this.slider.value).to.equal(10);
        this.slider.value = 50;
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('50');
        expect(this.slider.value).to.equal(50);
      });

      it('should set [value] and [valuenow] when calling ' +
      '_increaseValue(value)', function() {
        expect(this.slider.value).to.equal(0);
        this.slider._increaseValue(10);
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('10');
        expect(this.slider.value).to.equal(10);
      });

      it('should set [value] and [valuenow] when calling ' +
      '_increaseValue(value) within range', function() {
        expect(this.slider.value).to.equal(0);
        this.slider.value = 100;
        this.slider._increaseValue(10);
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('100');
        expect(this.slider.value).to.equal(100);
      });

      it('should set [value] and [valuenow] when calling ' +
      '_decreaseValue(value)', function() {
        expect(this.slider.value).to.equal(0);
        this.slider.value = 100;
        this.slider._decreaseValue(10);
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('90');
        expect(this.slider.value).to.equal(90);
      });

      it('should set [value] and [valuenow] when calling ' +
      '_decreaseValue(value) within range', function() {
        expect(this.slider.value).to.equal(0);
        this.slider._decreaseValue(10);
        expect(this.slider.getAttribute('aria-valuenow')).to.equal('0');
        expect(this.slider.value).to.equal(0);
      });

      it('should set minimum [value] and [valuenow] when calling ' +
      '_setMinValue()', function() {
        expect(this.slider.value).to.equal(0);
        this.slider.value = 99;
        expect(this.slider.value).to.equal(99);
        this.slider._setMinValue();
        const minValue = this.slider.getAttribute('aria-valuemin');
        expect(this.slider.getAttribute('aria-valuenow')).to.equal(minValue);
        expect(this.slider.value).to.equal(parseInt(minValue));
      });

      it('should set maximum [value] and [valuenow] when calling ' +
      '_setMaxValue()', function() {
        expect(this.slider.value).to.equal(0);
        this.slider.value = 1;
        expect(this.slider.value).to.equal(1);
        this.slider._setMaxValue();
        const maxValue = this.slider.getAttribute('aria-valuemax');
        expect(this.slider.getAttribute('aria-valuenow')).to.equal(maxValue);
        expect(this.slider.value).to.equal(parseInt(maxValue));
      });
    });
  });
})();
