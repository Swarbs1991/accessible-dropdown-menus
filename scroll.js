// scroll.js — smooth-scroll top-aligned navigation for same-page links
// - Intercepts clicks on in-page links inside the main menu
// - Computes header height and scrolls the target so it appears at the top
// - Moves focus to the target section for accessibility

(function () {
  'use strict';

  function getHeaderOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return 0;
    const rect = header.getBoundingClientRect();
    return rect.height || 0;
  }

  function smoothScrollTo(element) {
    const headerOffset = getHeaderOffset();
    const rect = element.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - headerOffset - 8; // small gap

    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

    // Move focus to the section after a short delay so screen readers follow.
    // We don't know exact timing of the smooth scroll, but 300ms is reasonable
    // for short pages; it's not critical if focus moves slightly earlier.
    setTimeout(() => {
      const hadTabIndex = element.hasAttribute('tabindex');
      if (!hadTabIndex) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus({ preventScroll: true });

      // Flash the section title with a short yellow highlight after the scroll
      // — find the first heading inside the target and add a temporary class.
      const heading = element.querySelector('h1,h2,h3,header');
      if (heading) {
        heading.classList.add('flash-highlight');
        const cleanup = () => {
          heading.classList.remove('flash-highlight');
          heading.removeEventListener('animationend', cleanup);
        };
        heading.addEventListener('animationend', cleanup);
      }

      if (!hadTabIndex) {
        element.removeAttribute('tabindex');
      }
    }, 350);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Only target main nav same-page links
    const links = document.querySelectorAll('.menu--main a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' ) return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        // Prevent the browser's default jump and do a smooth, top-aligned scroll
        e.preventDefault();

        // Close any open menus (if any) so the scroll target is visible
        const open = document.querySelectorAll('li.uncollapsed, li.menu-item--expanded');
        open.forEach((li) => li.classList.remove('uncollapsed', 'menu-item--expanded'));

        smoothScrollTo(target);

        // Update the URL hash without jumping
        if (history.pushState) {
          history.pushState(null, '', '#' + id);
        } else {
          // Fallback
          window.location.hash = '#' + id;
        }
      });
    });
  });
})();
