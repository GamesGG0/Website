# Games.GG Portfolio

Personal portfolio site for **Games.GG** — Roblox developer and Lua/Python programmer.

Live at **[gamesgg.net](https://gamesgg.net)**.

## Stack

- Plain **HTML / CSS / JavaScript** — no framework, no build step
- **Nginx** on Ubuntu (Linux)
- **Let's Encrypt** for HTTPS (via Certbot)
- **Inter** webfont (Google Fonts)

## Files

| File | Purpose |
|---|---|
| `index.html` | Home page — hero, about, skills, works, accomplishments, pricing, contact |
| `fictional-shenanigans.html` | Dedicated project page for *Fictional Shenanigans* |
| `404.html` | Custom 404 page |
| `styles.css` | All styling, dark theme |
| `script.js` | Interactive particle background, video gallery rendering, Discord click-to-copy |
| `deploy.bat` | One-shot deploy script for Windows (tar + scp + ssh extract) |

## Adding a video to the gallery

Edit the `videos` array near the top of `script.js`:

```js
const videos = [
  { type: 'youtube', id: 'VIDEO_ID', title: '...', description: '...', tags: [...], link: 'project.html', linkLabel: 'View Project' },
  { type: 'vimeo',   id: 'VIDEO_ID', title: '...', description: '...', tags: [...] },
  { type: 'mp4',     src: '/videos/clip.mp4', poster: '/videos/cover.jpg', title: '...', description: '...', tags: [...] },
];
```

## Deploying

Double-click `deploy.bat`. It bundles every file in this folder into a tarball, scps it to the server, extracts into the Nginx web root, and fixes ownership.

Requires:
- SSH key auth set up to the server
- `sudoers.d/deploy` rule on the server allowing `tar -xf /tmp/site.tar -C /var/www/gamesgg.net` and the corresponding `chown` without a password

## Contact

Discord: **Games.GG**
