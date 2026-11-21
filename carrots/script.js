// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
  });
}

// Gallery lightbox
const box = document.getElementById('lightbox');
if (box) {
  const img = box.querySelector('img');
  const cap = box.querySelector('p');
  document.querySelectorAll('.gallery button').forEach(btn => {
    btn.addEventListener('click', () => {
      const thumb = btn.querySelector('img');
      img.src = btn.dataset.full || thumb.src;
      img.alt = thumb.alt;
      cap.textContent = thumb.alt;
      box.showModal();
    });
  });
  box.querySelector('.close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
}

// Footer year
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
