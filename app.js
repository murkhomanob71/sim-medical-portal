(() => {
  const clock = document.querySelector('#live-clock');
  const dhakaTimeZone = 'Asia/Dhaka';

  if (clock) {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: dhakaTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: dhakaTimeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: dhakaTimeZone,
      weekday: 'long'
    });

    const updateClock = () => {
      const now = new Date();
      clock.textContent = `${timeFormatter.format(now)} | ${dateFormatter.format(now)} | ${dayFormatter.format(now)}`;
      clock.dateTime = now.toISOString();
      window.setTimeout(updateClock, 1000 - (Date.now() % 1000));
    };

    updateClock();
  }

  document.querySelectorAll('[data-placeholder="true"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const toast = document.querySelector('[data-toast]');
      const title = link.querySelector('.hex-card-title')?.textContent.trim();
      if (!toast) return;

      toast.textContent = `${title || 'This section'} is not connected yet.`;
      toast.classList.add('is-visible');
      window.clearTimeout(toast.hideTimer);
      toast.hideTimer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 2600);
    });
  });

  document.querySelectorAll('a[data-external-profile]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const isPlainLeftClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      if (!isPlainLeftClick) return;

      event.preventDefault();
      let profileTab = null;
      try {
        profileTab = window.open(link.href, '_blank');
      } catch (error) {
        // Sandboxed previews may forbid popups; fall back to the same tab below.
      }

      if (profileTab) {
        try {
          profileTab.opener = null;
        } catch (error) {
          // The new tab is already open; it can still load the requested profile.
        }
      } else {
        window.location.assign(link.href);
      }
    });
  });

  document.querySelectorAll('a[data-page-transition]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const isPlainLeftClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!isPlainLeftClick || prefersReducedMotion || link.target === '_blank') return;

      event.preventDefault();
      document.body.classList.add('page-is-leaving');
      window.setTimeout(() => {
        window.location.assign(link.href);
      }, 180);
    });
  });

  // Programmer-style typewriter for developer sign — runs once per page entry (Courier Prime, slow)
  document.querySelectorAll('[data-typewriter]').forEach((el) => {
    const full = el.textContent.trim();
    if (!full) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.innerHTML = '<span class="tw-text">' + full + '</span>';
      el.classList.add('is-done');
      return;
    }
    el.setAttribute('aria-label', 'Developed by ' + full);
    el.textContent = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'tw-text';
    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.append(textSpan, cursor);
    let i = 0;
    const typeNext = () => {
      if (i <= full.length) {
        textSpan.textContent = full.slice(0, i);
        i += 1;
        const lastChar = full[i - 2] || '';
        const delay = lastChar === ' ' ? 75 : 148;
        window.setTimeout(typeNext, delay + (Math.random() * 32));
      } else {
        el.classList.add('is-done');
        window.setTimeout(() => { cursor.style.opacity = '0'; }, 2200);
      }
    };
    window.setTimeout(typeNext, 760);
  });

  // Offline cache / installable app. Only works over http(s); file:// pages skip it.
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => null);
    });
  }
})();
