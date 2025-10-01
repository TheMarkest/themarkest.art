function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.bottom >= 0 && rect.top <= window.innerHeight;
}

function measureCardHeight(article) {
  const clone = article.cloneNode(true);
  clone.querySelectorAll('.scramble-text').forEach(el => {
    const txt = el.getAttribute('data-text') || el.textContent;
    el.textContent = txt;
  });
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.zIndex = '-9999';
  document.body.appendChild(clone);
  let h = clone.offsetHeight;
  const btn = clone.querySelector('.work-button');
  if (btn) {
    h += btn.offsetHeight;
  }
  document.body.removeChild(clone);
  return h;
}

(function initWaveCanvas() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let time = 0;
  let dots = [];
  const AMPLITUDE = 15;
  const DOT_SPACING = 40;
  const FREQ_MIN = 0.03;
  const FREQ_MAX = 0.08;
  const LINE_WIDTH = 2;
  const DOT_RADIUS = 4;
  const HEADER_BG_COLOR = 'rgba(85,85,85,0.8)';
  const BASELINE = 120;

  function initDots() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    dots = [];
    dots.push({ x: 0, pinned: true });
    for (let x = DOT_SPACING; x <= width - DOT_SPACING; x += DOT_SPACING) {
      dots.push({
        x,
        pinned: false,
        freq: FREQ_MIN + Math.random() * (FREQ_MAX - FREQ_MIN),
        phase: Math.random() * Math.PI * 2
      });
    }
    dots.push({ x: width, pinned: true });
  }

  function animateWave() {
    ctx.clearRect(0, 0, width, height);
    const wavePoints = dots.map(dot => {
      if (dot.pinned) return { x: dot.x, y: BASELINE };
      const wave = AMPLITUDE * Math.sin(dot.x * dot.freq + time + dot.phase);
      return { x: dot.x, y: BASELINE + wave };
    });
    ctx.beginPath();
    ctx.moveTo(0, 0);
    wavePoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fillStyle = HEADER_BG_COLOR;
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = LINE_WIDTH;
    wavePoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    wavePoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#0ff';
      ctx.fill();
    });
    time += 0.02;
    requestAnimationFrame(animateWave);
  }

  function onResize() {
    initDots();
  }

  window.addEventListener('resize', onResize);
  initDots();
  animateWave();
})();

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    this.el.innerHTML = '';
    const length = newText.length;
    const promise = new Promise(resolve => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const to = newText[i];
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30);
      this.queue.push({ from: '', to, start, end, char: null });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { to, start, end } = this.queue[i];
      let { char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += '';
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const scrambleObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const original = el.getAttribute('data-text') || el.textContent;
      el.textContent = '';
      const fx = new TextScramble(el);
      fx.setText(original);
      obs.unobserve(el);
    }
  });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

const cardObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const article = entry.target;
      const finalHeight = measureCardHeight(article);
      article.style.height = finalHeight + 'px';
      article.classList.add('visible');
      setTimeout(() => {
        article.querySelectorAll('.scramble-text').forEach(el => {
          scrambleObserver.observe(el);
        });
      }, 700);
      obs.unobserve(article);
    }
  });
}, { threshold: 0.1 });

const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    if (getComputedStyle(navLinks).display === 'none') {
      navLinks.style.display = 'flex';
    } else {
      navLinks.style.display = 'none';
    }
  });
}

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalTitleBar = document.getElementById('modal-title-bar');
const modalTitleText = document.getElementById('modal-title-text');
const modalMediaWrapper = document.getElementById('modal-media-wrapper');
const modalClose = document.getElementById('modal-close');
const portfolioContainer = document.getElementById('portfolio-container');

if (portfolioContainer && modal && modalTitleText && modalMediaWrapper && modalClose) {
  portfolioContainer.addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('work-thumb')) {
      const article = target.closest('.work-item');
      let titleText = '';
      if (article) {
        const titleEl = article.querySelector('h3');
        if (titleEl) {
          titleText = titleEl.textContent.trim();
        }
      }
      modalTitleText.textContent = titleText || 'Untitled';
      modalMediaWrapper.innerHTML = '';
      modal.style.display = 'block';
      if (target.tagName.toLowerCase() === 'img') {
        const img = document.createElement('img');
        img.src = target.src;
        img.className = 'modal-media';
        modalMediaWrapper.appendChild(img);
      } else if (target.tagName.toLowerCase() === 'video') {
        const video = document.createElement('video');
        const sourceEl = target.querySelector('source');
        if (sourceEl) {
          video.src = sourceEl.src;
          video.type = sourceEl.type;
        } else {
          video.src = target.src;
        }
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.className = 'modal-media';
        modalMediaWrapper.appendChild(video);
      }
    }
  });

  modalClose.addEventListener('click', function () {
    modal.style.display = 'none';
    modalMediaWrapper.innerHTML = '';
    modalTitleText.textContent = '';
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      modalMediaWrapper.innerHTML = '';
      modalTitleText.textContent = '';
    }
  });
}

let currentLang = 'EN';
let quotesArray = [];

function sanitize(val) {
  if (!val) return '';
  return val.toString().replace(/^"+|"+$/g, '').trim();
}

document.addEventListener('DOMContentLoaded', () => {
  const supportedLangs = ['ru', 'kz', 'ua', 'en'];
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  let selectedLang;
  if (pathSegments.length > 0 && supportedLangs.includes(pathSegments[0].toLowerCase())) {
    selectedLang = pathSegments[0].toUpperCase();
  } else {
    const sysLang = navigator.language || navigator.userLanguage || 'en';
    const langLower = sysLang.toLowerCase();
    if (langLower.startsWith('ru')) {
      selectedLang = 'RU';
    } else if (langLower.startsWith('kz')) {
      selectedLang = 'KZ';
    } else if (langLower.startsWith('uk') || langLower.startsWith('ua')) {
      selectedLang = 'UA';
    } else {
      selectedLang = 'EN';
    }
  }
  loadLanguage(selectedLang);
  document.querySelectorAll('.language-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      loadLanguage(button.textContent.trim());
    });
  });
  const dropdown = document.querySelector('.language-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', e => {
      loadLanguage(e.target.value);
    });
  }
});

function loadLanguage(lang) {
  currentLang = lang;
  fetch(lang.toLowerCase() + 'text.json')
    .then(response => response.json())
    .then(data => {
      if (data.title) {
        document.title = data.title;
      }
      if (data.metaDescription) {
        document.querySelector('meta[name="description"]').setAttribute('content', data.metaDescription);
      }
      document.getElementById('nav-cover').textContent = data.nav.cover;
      document.getElementById('nav-portfolio').textContent = data.nav.portfolio;
      document.getElementById('nav-about').textContent = data.nav.about;
      document.getElementById('nav-contact').textContent = data.nav.contact;
      document.getElementById('cover-heading').textContent = data.cover.heading;
      const coverSub = document.getElementById('cover-subheading');
      coverSub.setAttribute('data-text', data.cover.subheading);
      coverSub.textContent = '';
      const fxCover = new TextScramble(coverSub);
      fxCover.setText(data.cover.subheading);
      document.getElementById('portfolio-heading').textContent = data.sections.portfolio;
      document.getElementById('about-heading').textContent = data.sections.about;
      document.getElementById('contact-heading').textContent = data.sections.contact;
      const bioEl = document.getElementById('bio-text');
      bioEl.setAttribute('data-text', data.about.bioText);
      bioEl.textContent = '';
      if (isInViewport(bioEl)) {
        const fxBio = new TextScramble(bioEl);
        fxBio.setText(data.about.bioText);
      } else {
        bioEl.classList.add('scramble-text');
        scrambleObserver.observe(bioEl);
      }
      const statementEl = document.getElementById('statement-text');
      statementEl.setAttribute('data-text', data.about.statementText);
      statementEl.textContent = '';
      if (isInViewport(statementEl)) {
        const fxStatement = new TextScramble(statementEl);
        fxStatement.setText(data.about.statementText);
      } else {
        statementEl.classList.add('scramble-text');
        scrambleObserver.observe(statementEl);
      }
      document.getElementById('btn-telegram').textContent = data.contactButtons.telegram;
      document.getElementById('btn-instagram').textContent = data.contactButtons.instagram;
      document.getElementById('btn-phone').textContent = data.contactButtons.phone;
      document.getElementById('btn-email').textContent = data.contactButtons.email;
      document.getElementById('footer-text').innerHTML = data.footer;
    })
    .catch(error => console.error('Error loading language file:', error));

  fetch(lang.toLowerCase() + 'quote.json')
    .then(response => response.json())
    .then(data => {
      quotesArray = data;
    })
    .catch(error => console.error('Error loading quotes file:', error));

  fetch(lang.toLowerCase() + 'port.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('portfolio-container');
      container.innerHTML = '';
      data.forEach(item => {
        const allEmpty = Object.values(item).every(val => {
          if (typeof val === 'string') return val.trim() === '';
          return !val;
        });
        if (allEmpty) return;
        const article = document.createElement('article');
        article.className = 'work-item';
        const media = document.createElement('div');
        media.className = 'work-media';
        const mediaId = sanitize(item.mediaid);
        let mediaElement;
        if (mediaId) {
          if (mediaId.includes('.')) {
            const ext = mediaId.substring(mediaId.lastIndexOf('.')).toLowerCase();
            if (ext === '.mp4' || ext === '.webm') {
              mediaElement = document.createElement('video');
              mediaElement.setAttribute('controls', 'controls');
              mediaElement.setAttribute('loading', 'lazy');
              mediaElement.setAttribute('decoding', 'async');
              mediaElement.classList.add('work-thumb');
              const source = document.createElement('source');
              source.src = 'assets/' + mediaId;
              source.type = ext === '.mp4' ? 'video/mp4' : 'video/webm';
              mediaElement.appendChild(source);
            } else {
              mediaElement = document.createElement('img');
              mediaElement.src = 'assets/' + mediaId;
              mediaElement.alt = sanitize(item.title) || 'Work Image';
              mediaElement.className = 'work-thumb';
              mediaElement.setAttribute('loading', 'lazy');
              mediaElement.setAttribute('decoding', 'async');
            }
          } else {
            const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'];
            const videoExtensions = ['.mp4', '.webm'];
            const extList = imageExtensions.concat(videoExtensions);
            let attempt = 0;
            mediaElement = document.createElement('img');
            mediaElement.alt = sanitize(item.title) || 'Work Image';
            mediaElement.className = 'work-thumb';
            mediaElement.setAttribute('loading', 'lazy');
            mediaElement.setAttribute('decoding', 'async');
            function tryNext() {
              if (attempt >= extList.length) {
                mediaElement.onerror = null;
                mediaElement.src = 'assets/logo.svg';
                return;
              }
              const url = 'assets/' + mediaId + extList[attempt];
              attempt++;
              mediaElement.src = url;
            }
            mediaElement.onerror = function () {
              tryNext();
            };
            mediaElement.onload = function () {
              mediaElement.onerror = null;
            };
            tryNext();
          }
        } else {
          const placeholderDiv = document.createElement('div');
          placeholderDiv.className = 'placeholder-logo';
          const placeholderImg = document.createElement('img');
          placeholderImg.src = 'assets/logo.svg';
          placeholderImg.alt = 'Placeholder';
          placeholderDiv.appendChild(placeholderImg);
          mediaElement = placeholderDiv;
        }
        media.appendChild(mediaElement);
        const details = document.createElement('div');
        details.className = 'work-details';
        const h3 = document.createElement('h3');
        h3.textContent = sanitize(item.title) || 'Untitled';
        const pYear = document.createElement('p');
        pYear.innerHTML = "Year: <span class='scramble-text' data-text='" + (sanitize(item.year) || '—') + "'>-</span>";
        const pDesc = document.createElement('p');
        pDesc.innerHTML = "Description: <span class='scramble-text' data-text='" + (sanitize(item.description) || '') + "'>-</span>";
        const pMaterials = document.createElement('p');
        pMaterials.innerHTML = "Materials: <span class='scramble-text' data-text='" + (sanitize(item.materials) || '—') + "'>-</span>";
        const pStatus = document.createElement('p');
        pStatus.innerHTML = "Status: <span class='scramble-text' data-text='" + (sanitize(item.status) || '—') + "'>-</span>";
        details.appendChild(h3);
        details.appendChild(pYear);
        details.appendChild(pDesc);
        details.appendChild(pMaterials);
        details.appendChild(pStatus);
        const btnName = sanitize(item.btnname);
        const btnLink = sanitize(item.btnlink);
        if (btnName !== '' && btnLink !== '') {
          const btn = document.createElement('a');
          btn.textContent = btnName;
          btn.href = btnLink;
          btn.className = 'work-button';
          btn.target = '_blank';
          details.appendChild(btn);
        }
        article.appendChild(media);
        article.appendChild(details);
        container.appendChild(article);
        cardObserver.observe(article);
      });
    })
    .catch(error => console.error('Error loading portfolio file:', error));
}

function spawnQuote() {
  if (quotesArray.length === 0) return;
  const q = quotesArray[Math.floor(Math.random() * quotesArray.length)];
  const div = document.createElement('div');
  div.className = 'floating-quote';
  div.innerHTML = `
        <span class="quote-text">${q.text}</span>
        <span class="quote-author">${q.author}</span>
      `;
  let x;
  let y;
  if (Math.random() < 0.7) {
    x = 0.1 * window.innerWidth + Math.random() * (0.8 * window.innerWidth);
    y = 0.1 * window.innerHeight + Math.random() * (0.8 * window.innerHeight);
  } else {
    const docWidth = document.documentElement.scrollWidth;
    const docHeight = document.documentElement.scrollHeight;
    x = 0.05 * docWidth + Math.random() * (0.9 * docWidth);
    y = 0.1 * docHeight + Math.random() * (0.8 * docHeight);
  }
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  document.body.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 10000);
}

setInterval(spawnQuote, 5000);
