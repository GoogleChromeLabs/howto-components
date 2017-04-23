(function() {
  const expect = chai.expect;

  describe('howto-checkbox', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `<howto-checkbox></howto-checkbox>`;
      return howtoComponents.waitForElement('howto-checkbox')
        .then(_ => {
          this.checkbox = this.container.querySelector('howto-checkbox');
        });
    });

    it('should add a [role] to the checkbox', function() {
      expect(this.checkbox.getAttribute('role')).to.equal('checkbox');
    });

    it('should add a [tabindex] to the checkbox', function() {
      expect(this.checkbox.getAttribute('tabindex')).to.equal('0');
    });

    describe('checked', function() {
      it('should toggle [checked] and [aria-checked] when calling ' +
        '_toggleChecked()', function() {
          expect(this.checkbox.checked).to.equal(false);
          this.checkbox._toggleChecked();
          expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
          expect(this.checkbox.checked).to.equal(true);
        });

      it('should toggle [checked] and [aria-checked] when setting .checked',
        function() {
          expect(this.checkbox.checked).to.equal(false);
          this.checkbox.checked = true;
          expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
          expect(this.checkbox.checked).to.equal(true);
          this.checkbox.checked = false;
          expect(this.checkbox.getAttribute('aria-checked')).to.equal('false');
          expect(this.checkbox.checked).to.equal(false);
        });

      it('should handle truthy/falsy values for .checked', function() {
        expect(this.checkbox.checked).to.equal(false);
        this.checkbox.checked = '0';
        expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
        expect(this.checkbox.hasAttribute('checked')).to.equal(true);
        expect(this.checkbox.checked).to.equal(true);
        this.checkbox.checked = undefined;
        expect(this.checkbox.getAttribute('aria-checked')).to.equal('false');
        expect(this.checkbox.hasAttribute('checked')).to.equal(false);
        expect(this.checkbox.checked).to.equal(false);
        this.checkbox.checked = 1;
        expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
        expect(this.checkbox.hasAttribute('checked')).to.equal(true);
        expect(this.checkbox.checked).to.equal(true);
      });

      it('should toggle .checked, [aria-checked] when setting [checked]',
        function() {
          expect(this.checkbox.hasAttribute('checked')).to.equal(false);
          this.checkbox.setAttribute('checked', '');
          expect(this.checkbox.getAttribute('aria-checked')).to.equal('true');
          expect(this.checkbox.checked).to.equal(true);
          this.checkbox.removeAttribute('checked');
          expect(this.checkbox.getAttribute('aria-checked')).to.equal('false');
          expect(this.checkbox.checked).to.equal(false);
        });
    });

    describe('disabled', function() {
      it('should toggle [disabled], [aria-disabled], and [tabindex] when ' +
        'setting .disabled', function() {
          expect(this.checkbox.disabled).to.equal(false);
          this.checkbox.disabled = true;
          expect(this.checkbox.getAttribute('aria-disabled')).to.equal('true');
          expect(this.checkbox.hasAttribute('tabindex')).to.equal(false);
          expect(this.checkbox.disabled).to.equal(true);
          this.checkbox.disabled = false;
          expect(this.checkbox.getAttribute('aria-disabled')).to.equal('false');
          expect(this.checkbox.getAttribute('tabindex')).to.equal('0');
          expect(this.checkbox.disabled).to.equal(false);
        });

      it('should handle truthy/falsy values for .disabled', function() {
        expect(this.checkbox.disabled).to.equal(false);
        this.checkbox.disabled = '0';
        expect(this.checkbox.getAttribute('aria-disabled')).to.equal('true');
        expect(this.checkbox.hasAttribute('disabled')).to.equal(true);
        expect(this.checkbox.disabled).to.equal(true);
        this.checkbox.disabled = undefined;
        expect(this.checkbox.getAttribute('aria-disabled')).to.equal('false');
        expect(this.checkbox.hasAttribute('disabled')).to.equal(false);
        expect(this.checkbox.disabled).to.equal(false);
        this.checkbox.disabled = 1;
        expect(this.checkbox.getAttribute('aria-disabled')).to.equal('true');
        expect(this.checkbox.hasAttribute('disabled')).to.equal(true);
        expect(this.checkbox.disabled).to.equal(true);
      });

      it('should toggle .disabled, [aria-disabled] when setting [disabled]',
        function() {
          expect(this.checkbox.hasAttribute('disabled')).to.equal(false);
          this.checkbox.setAttribute('disabled', '');
          expect(this.checkbox.getAttribute('aria-disabled')).to.equal('true');
          expect(this.checkbox.disabled).to.equal(true);
          this.checkbox.removeAttribute('disabled');
          expect(this.checkbox.getAttribute('aria-disabled')).to.equal('false');
          expect(this.checkbox.disabled).to.equal(false);
        });
    });
  });
})();
