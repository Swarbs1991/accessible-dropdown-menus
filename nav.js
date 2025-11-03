// nav.js — simple accessible dropdown behaviour for demo
// - Toggles an "uncollapsed" class on top-level menu items with children
// - Also toggles menu-item--expanded/menu-item--collapsed for compatibility
// - Updates aria-expanded on the triggering <a>

(function () {
  'use strict';

  // Instead of relying on a special CSS class on parent items, detect
  // list items that have a direct child <ul> (the submenu).
  const UNCOLLAPSED_CLASS = 'uncollapsed';
  const COLLAPSED_CLASS = 'collapsed';
  const EXPANDED_CLASS = 'menu-item--expanded';
  const COLLAPSED_COMPAT = 'menu-item--collapsed';

  function isInside(element, container) {
    return container.contains(element);
  }

  function setExpandedState(li, expanded) {
    const toggle = li.querySelector(':scope > a');
    // Ensure aria-expanded is present on the list item (as requested)
    li.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    // Keep the toggle element's aria-expanded in sync as well (backwards compatibility)
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    if (expanded) {
      li.classList.add(UNCOLLAPSED_CLASS);
      li.classList.add(EXPANDED_CLASS);
      li.classList.remove(COLLAPSED_CLASS);
      li.classList.remove(COLLAPSED_COMPAT);
    } else {
      li.classList.remove(UNCOLLAPSED_CLASS);
      li.classList.remove(EXPANDED_CLASS);
      li.classList.add(COLLAPSED_CLASS);
      li.classList.add(COLLAPSED_COMPAT);
    }
  }

  function openMenu(li) {
    setExpandedState(li, true);
  }

  function closeMenu(li) {
    setExpandedState(li, false);
  }

  function toggleMenu(li) {
    const isOpen = li.classList.contains(UNCOLLAPSED_CLASS) || li.classList.contains(EXPANDED_CLASS);
    setExpandedState(li, !isOpen);
  }

  function attach(li) {
    const toggle = li.querySelector(':scope > a');
    if (!toggle) return;

    // mouse
    li.addEventListener('mouseenter', () => openMenu(li));
    li.addEventListener('mouseleave', () => closeMenu(li));

    // focus handling (keyboard)
    li.addEventListener('focusin', () => openMenu(li));
    li.addEventListener('focusout', (e) => {
      // if focus moved outside the li, close
      const related = e.relatedTarget;
      if (!related || !isInside(related, li)) {
        closeMenu(li);
      }
    });

    // keyboard toggle on Enter/Space
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // prevent navigation on Space/Enter to allow expand/collapse
        e.preventDefault();
        toggleMenu(li);
      } else if (e.key === 'Escape') {
        closeMenu(li);
        toggle.focus();
      }
    });

    // click: toggle for touch devices (prevent following the link)
    toggle.addEventListener('click', (e) => {
      // If the anchor is a hash or same-page link, toggling is helpful. We'll
      // prevent default and toggle so users can access the submenu first.
      // If you prefer the link to navigate, remove this preventDefault.
      e.preventDefault();
      toggleMenu(li);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Select top-level menu items from the main menu and attach behaviour
    // to those which have a submenu as a direct child (e.g. <ul class="menu--sub-menu">)
    const rootItems = document.querySelectorAll('ul.menu--main > li');
    rootItems.forEach((li) => {
      // Only attach behaviour to items that have a direct child <ul>
      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;

      // Initialize aria-expanded on the anchor toggle if missing
      const toggle = li.querySelector(':scope > a');
      if (toggle && !toggle.hasAttribute('aria-expanded')) {
        toggle.setAttribute('aria-expanded', 'false');
      }

      // Ensure the li has an explicit aria-expanded state as well
      if (!li.hasAttribute('aria-expanded')) {
        li.setAttribute('aria-expanded', 'false');
      }

      attach(li);
    });
  });
})();
