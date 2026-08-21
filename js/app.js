const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function inlineMarkdown(text) {
  let value = escapeHtml(text);
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\*(.+?)\*/g, '<em>$1</em>');
  value = value.replace(/`(.+?)`/g, '<code>$1</code>');
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return value;
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const output = [];
  let paragraph = [];
  let list = null;
  let quote = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      output.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      output.push(`<blockquote>${inlineMarkdown(quote.join(' '))}</blockquote>`);
      quote = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph(); flushList(); flushQuote();
      continue;
    }
    if (line.startsWith('> ')) {
      flushParagraph(); flushList(); quote.push(line.slice(2));
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList(); flushQuote();
      const level = Math.min(4, heading[1].length);
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph(); flushQuote();
      list ??= [];
      list.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }
    if (line.startsWith('BUTTONS:')) {
      flushParagraph(); flushList(); flushQuote();
      const links = line.slice(8).split('|').map(part => part.trim()).filter(Boolean);
      const buttons = links.map(part => {
        const [label, href] = part.split('=>').map(v => v.trim());
        return `<a href="${escapeHtml(href || '#')}">${escapeHtml(label || 'Open')}</a>`;
      }).join('');
      output.push(`<div class="button-row">${buttons}</div>`);
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph(); flushList(); flushQuote();
  return output.join('\n');
}

async function loadMarkdown() {
  const nodes = [...document.querySelectorAll('[data-md]')];
  await Promise.all(nodes.map(async (node) => {
    try {
      const response = await fetch(node.dataset.md, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      node.innerHTML = parseMarkdown(await response.text());
    } catch (error) {
      node.innerHTML = `<p><strong>Content could not be loaded.</strong> Serve this folder through a static web server instead of opening index.html directly. See README.md.</p>`;
      console.error(error);
    }
  }));
}

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('img');
document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('click', () => {
    lightboxImage.src = card.dataset.full;
    lightbox.showModal();
  });
});
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

loadMarkdown();
