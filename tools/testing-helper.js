window.dashElements = {};

/**
 * `elementTest` is a wrapper for Mocha tests. The wrapper ensures that the
 * custom element has been loaded and all instances have been upgraded before
 * running the test. Additionally, wrapped functions are allowed to return
 * promises for asynchronous tests.
 */
window.dashElements.elementTest = function(elementName, f) {
  return function(done) {
    customElements.whenDefined(elementName)
      .then(_ => {
        Promise.resolve(f.call(this))
          .then(_ => done())
          .catch(err => done(err));
      });
  };
};

/**
 * `before` is a wrapper for Mocha’s before() function and adds a “testing area”
 * to the DOM. The element is accessible inside test function via
 * `this.container`. The container can be used to inject markup for the
 * custom element that is supposed to be tested.
 */
window.dashElements.before = function(f) {
  return function() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    f && f.call(this);
  };
};

/**
 * `after` cleans up the “testing area” added by `before()`.
 */
window.dashElements.after = function(f) {
  return function() {
    this.container.remove();
    this.container = null;
    f && f.call(this);
  };
};