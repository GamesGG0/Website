// ============================================================
// VIDEO GALLERY — add your works here
// ============================================================
// To add a new video, just append a new object to this array.
// Three supported types:
//
//   { type: 'youtube', id: 'VIDEO_ID', title: '...', description: '...', tags: [...] }
//     — id is the part after "v=" in a YouTube URL,
//       e.g. https://youtu.be/dQw4w9WgXcQ  →  id: 'dQw4w9WgXcQ'
//
//   { type: 'vimeo',   id: 'VIDEO_ID', title: '...', description: '...', tags: [...] }
//     — id is the number from a Vimeo URL,
//       e.g. https://vimeo.com/76979871   →   id: '76979871'
//
//   { type: 'mp4',     src: '/path/to/video.mp4', poster: '/path/to/cover.jpg', title: '...', description: '...', tags: [...] }
//     — for self-hosted videos uploaded to /var/www/gamesgg.net/videos/
//       poster is optional (a thumbnail image shown before play).
//
// Order matters — videos render top-to-bottom in this list.
// ============================================================
const videos = [
  {
    type: 'youtube',
    id: 'jNQXAC9IVRw', // PLACEHOLDER — replace with your real Fictional Shenanigans trailer/clip ID
    title: 'Fictional Shenanigans',
    description: 'A Roblox battlegrounds game featuring custom combat, characters, and abilities.',
    tags: ['Roblox', 'Lua', 'Battlegrounds'],
    link: 'fictional-shenanigans.html', // opens the project page
    linkLabel: 'View Project',
  },
];

// Render gallery
function renderVideoGallery() {
  const root = document.getElementById('videoGallery');
  if (!root) return;

  if (!videos.length) {
    root.innerHTML = '<p class="empty-gallery">No videos yet — check back soon.</p>';
    return;
  }

  root.innerHTML = videos.map(v => {
    let embed = '';
    if (v.type === 'youtube') {
      embed = `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${escapeHTML(v.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (v.type === 'vimeo') {
      embed = `<iframe src="https://player.vimeo.com/video/${v.id}" title="${escapeHTML(v.title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else if (v.type === 'mp4') {
      embed = `<video controls preload="metadata"${v.poster ? ` poster="${v.poster}"` : ''}><source src="${v.src}" type="video/mp4">Your browser doesn't support embedded video.</source></video>`;
    }
    const tags = (v.tags || []).map(t => `<span>${escapeHTML(t)}</span>`).join('');
    const link = v.link ? `<a href="${escapeHTML(v.link)}" class="video-link"${/^https?:/i.test(v.link) ? ' target="_blank" rel="noopener"' : ''}>${escapeHTML(v.linkLabel || 'View Project')} &rarr;</a>` : '';
    return `
      <article class="video-card">
        <div class="video-frame">${embed}</div>
        <div class="video-body">
          <h3>${escapeHTML(v.title || '')}</h3>
          <p>${escapeHTML(v.description || '')}</p>
          ${tags ? `<div class="tags">${tags}</div>` : ''}
          ${link}
        </div>
      </article>
    `;
  }).join('');
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

renderVideoGallery();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// Contact form (client-side only)
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.name || !data.email || !data.message) {
      status.textContent = 'Please fill in all fields.';
      status.className = 'form-status error';
      return;
    }
    console.log('Submitted:', data);
    status.textContent = 'Thanks! Your message has been sent.';
    status.className = 'form-status success';
    form.reset();
  });
}

// Discord embed — copy username to clipboard on click / Enter / Space
const discordLink = document.getElementById('discordLink');
const copyHint = document.getElementById('copyHint');
if (discordLink && copyHint) {
  const copy = () => {
    navigator.clipboard.writeText('Games.GG').then(() => {
      copyHint.textContent = 'Copied Games.GG to clipboard!';
      copyHint.classList.add('show');
      setTimeout(() => copyHint.classList.remove('show'), 2000);
    }).catch(() => {
      copyHint.textContent = 'Discord: Games.GG';
      copyHint.classList.add('show');
    });
  };
  discordLink.addEventListener('click', (e) => { e.preventDefault(); copy(); });
  discordLink.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
  });
}

// ============================================================
// Interactive particle-network background
// Particles drift, connect with lines when nearby, and react to
// the cursor (push away + brighten connections under the mouse).
// ============================================================
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles;
  const mouse = { x: -9999, y: -9999, active: false };

  // Tunables
  const DENSITY = 0.00009;   // particles per px^2
  const MAX_LINK = 130;      // px — link distance
  const MOUSE_RADIUS = 160;  // px — interactive radius
  const SPEED = 0.35;        // base drift speed

  function resize() {
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(1, 1);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(140, Math.max(40, Math.floor(width * height * DENSITY / devicePixelRatio)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * devicePixelRatio,
        vy: (Math.random() - 0.5) * SPEED * devicePixelRatio,
        r: (Math.random() * 1.6 + 0.8) * devicePixelRatio,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    const linkDist = MAX_LINK * devicePixelRatio;
    const mouseR = MOUSE_RADIUS * devicePixelRatio;

    // Update + draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseR && dist > 0) {
          const force = (1 - dist / mouseR) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Friction so they don't accelerate forever
      p.vx *= 0.97;
      p.vy *= 0.97;

      // Keep a baseline drift
      const speed = Math.hypot(p.vx, p.vy);
      const minSpeed = 0.15 * devicePixelRatio;
      if (speed < minSpeed) {
        p.vx += (Math.random() - 0.5) * 0.05 * devicePixelRatio;
        p.vy += (Math.random() - 0.5) * 0.05 * devicePixelRatio;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.85)';
      ctx.fill();
    }

    // Draw links
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.35;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 1 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // Link from particle to mouse
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseR) {
          const alpha = (1 - dist / mouseR) * 0.6;
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 1.2 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX * devicePixelRatio;
    mouse.y = e.clientY * devicePixelRatio;
    mouse.active = true;
  });
  window.addEventListener('mouseout', () => { mouse.active = false; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouse.x = e.touches[0].clientX * devicePixelRatio;
      mouse.y = e.touches[0].clientY * devicePixelRatio;
      mouse.active = true;
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.active = false; });

  resize();
  step();
})();
