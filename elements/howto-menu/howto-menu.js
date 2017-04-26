/*
 * A menu is a widget that offers a list of choices to the user,
 * such as a set of actions or functions. A menu is usually opened,
 * or made visible, by activating a menu button, choosing an item in a menu
 * that opens a sub menu, or by invoking a command, such as Shift + F10 in
 * Windows, that opens a context specific menu.
 *
 * The element that opens the menu is referenced with aria-labelledby.
 * TODO(devnook): Should it be aria-labelledby or aria-describedby?
 *
 * See: https://www.w3.org/TR/wai-aria-practices-1.1/#menu
 */

 class HowtoMenu extends HTMLElement {

   /**
    * The constructor does work that needs to be executed _exactly_ once.
    */
   constructor() {
     super();

     this.KEY_CODES_ = {
       ARROW_DOWN: 40,
       ARROW_UP: 38,
       ESCAPE: 27,
     };
     this.children_ = null;
     // TODO: Consider better naming?
     this.parent_ = document.getElementById(
         this.getAttribute('aria-labelledby'));
   }

   moveFocus_(fromEl, toEl) {
     fromEl.setAttribute('tabindex', -1);
     toEl.setAttribute('tabindex', 0);
     toEl.focus();
   }

   handleBlur_(e) {
     e.target.setAttribute('tabindex', -1);
   }

   handleKeyDown_(e) {
     let el = e.target;
     switch (true) {
       case e.keyCode === this.KEY_CODES_.ARROW_DOWN:
         // If arrow down, move to next item. Wrap if necessary.
         let next = el.nextElementSibling || this.firstElementChild;
         this.moveFocus_(el, next);
         break;
       case e.keyCode === this.KEY_CODES_.ARROW_UP:
         // If arrow up, move to previous item. Wrap if necessary.
         let prev = el.previousElementSibling || this.lastElementChild;
         this.moveFocus_(el, prev);
         break;
       case (e.keyCode > 64 && e.keyCode < 91):  // Letter keys.
         // If letter key, move to item which starts with that letter.
         for (let i = 0, child; child = this.children[i]; i++) {
           if (child.innerText.trim()[0] === e.key) {
             this.moveFocus_(el, child);
           }
         }
         break;
       case e.keyCode === this.KEY_CODES_.ESCAPE:
         // If escape, exit the menu.
         el.setAttribute('tabindex', -1);
         this.parent_.focus();
         this.toggle();
         break;
       // TODO: What should Tab key do?
       default:
         break;
     };
   }

   /**
    * Sets up keyboard interactions for menu and its items.
    */
   connectedCallback() {
     // Make children unfocusable by default.
     this.children_ = Array.from(this.children);
     this.children_.forEach(el => {
       el.setAttribute('tabindex', -1);
       el.addEventListener('blur', this.handleBlur_);
     });
     this.setAttribute('aria-role', 'menu');
     this.addEventListener('keydown', this.handleKeyDown_);
   }

   /**
    * Unregisters the event listeners that were set up in `connectedCallback`.
    */
   disconnectedCallback() {
     this.children_.forEach(el => {
       el.removeEventListener('blur', this.handleBlur_);
     });
     this.removeEventListener('keydown', this.handleKeyDown_);
   }

   /**
    * Open the menu if it was closed and vice versa.
    */
   toggle() {
     // If the menu is hidden, show it.
     let makeOpen = this.getAttribute('aria-hidden') === 'true';
     this.setAttribute('aria-hidden', !makeOpen);
     if (makeOpen) {
       // Set focus to the first item.
       this.firstElementChild.setAttribute('tabindex', 0);
       this.firstElementChild.focus();
     }
   }
 }

 window.customElements.define('howto-menu', HowtoMenu);
