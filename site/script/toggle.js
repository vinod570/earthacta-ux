/* ==========================================================
   toggle.js — generic, reusable toggle / expand system
   Works for every collapse, expand, or show/hide component on
   the site. No JS changes needed per component — just add
   data attributes to your HTML.

   Place this file's <script> tag at the bottom of <body>,
   once, site-wide.
   ========================================================== */

document.addEventListener('click', function (e) {

  /* ---- dismiss-only trigger, e.g. a modal's "x" close button ---- */
  var dismissBtn = e.target.closest('[data-dismiss]');
  if (dismissBtn) {
    e.stopPropagation();
    var dismissSelector = dismissBtn.getAttribute('data-dismiss');
    var dismissScope     = dismissBtn.getAttribute('data-toggle-scope');
    var dismissClass     = dismissBtn.getAttribute('data-toggle-class') || 'open';
    var dismissRoot = dismissScope ? dismissBtn.closest(dismissScope) : document;
    var dismissTarget = dismissRoot && dismissRoot.querySelector(dismissSelector);
    if (dismissTarget) dismissTarget.classList.remove(dismissClass);
    return;
  }

  /* ---- clicking the dark backdrop itself closes the modal ---- */
  if (e.target.classList.contains('modal') && e.target.classList.contains('open')) {
    e.target.classList.remove('open');
    return;
  }

  var trigger = e.target.closest('[data-toggle]');
  if (!trigger) return;

  e.stopPropagation();

  /* -----------------------------------------------------------
     data-toggle        -> CSS selector of the element to toggle
     data-toggle-class   -> class name to add/remove (default: "open")
     data-toggle-scope    -> optional selector for the closest
                             ancestor to search within, instead of
                             the whole document (useful when the
                             same component repeats on a page)
     data-toggle-group    -> optional group name; opening one
                             trigger in a group closes the others
     ----------------------------------------------------------- */
  var targetSelector = trigger.getAttribute('data-toggle');
  var className       = trigger.getAttribute('data-toggle-class') || 'open';
  var scopeSelector    = trigger.getAttribute('data-toggle-scope');
  var groupName        = trigger.getAttribute('data-toggle-group');

  var root = scopeSelector ? trigger.closest(scopeSelector) : document;
  if (!root) return;

  var target = root.querySelector(targetSelector);
  if (!target) return;

  var willOpen = !target.classList.contains(className);

  /* close other members of the same group first */
  if (groupName) {
    document.querySelectorAll('[data-toggle-group="' + groupName + '"]').forEach(function (otherTrigger) {
      if (otherTrigger === trigger) return;
      var otherRoot = scopeSelector ? otherTrigger.closest(scopeSelector) : document;
      var otherTarget = otherRoot && otherRoot.querySelector(otherTrigger.getAttribute('data-toggle'));
      var otherClass = otherTrigger.getAttribute('data-toggle-class') || 'open';
      if (otherTarget) otherTarget.classList.remove(otherClass);
      otherTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  target.classList.toggle(className, willOpen);
  trigger.setAttribute('aria-expanded', String(willOpen));
});

/* Escape key closes any open modal */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal.open').forEach(function (modal) {
    modal.classList.remove('open');
  });
});
