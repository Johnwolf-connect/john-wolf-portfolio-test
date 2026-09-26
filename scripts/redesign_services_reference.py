from pathlib import Path

app_path = Path('src/App.jsx')
css_path = Path('src/styles.css')
app = app_path.read_text()
css = css_path.read_text()

old_heading = '''            <div className="carousel-heading">
              <p>Services</p>
              <h2>Move through the work.</h2>
              <button
                className="services-contact-button"
                type="button"
                onClick={() =>
                  navigateToSection('Contact', true)
                }
              >
                Contact
                <span aria-hidden="true">↗</span>
              </button>
            </div>'''

new_heading = '''            <div className="carousel-heading">
              <p>Services</p>
              <h2>Move through the work.</h2>
              <span className="services-intro">
                We design experiences that feel effortless from the first frame to the last.
              </span>
              <button
                className="services-contact-button"
                type="button"
                onClick={() =>
                  navigateToSection('Contact', true)
                }
              >
                <svg
                  className="services-contact-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                Contact Us
                <span aria-hidden="true">→</span>
              </button>
            </div>'''

if old_heading not in app:
    raise SystemExit('Services heading block not found')
app = app.replace(old_heading, new_heading, 1)

old_note = '''            <div className="carousel-scroll-note">
              <span>Scroll / drag · snap to explore</span>
              <i />
            </div>'''

new_note = '''            <div className="services-scroll-cue" aria-hidden="true">
              <span>↓</span>
              <small>Scroll to explore</small>
            </div>

            <div className="services-card-nav" aria-label="Service card navigation">
              <button
                type="button"
                aria-label="Previous service"
                onClick={() =>
                  archiveLoopApi.current?.moveBy?.(-1)
                }
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next service"
                onClick={() =>
                  archiveLoopApi.current?.moveBy?.(1)
                }
              >
                →
              </button>
            </div>'''

if old_note not in app:
    raise SystemExit('Services scroll note block not found')
app = app.replace(old_note, new_note, 1)

if '-50 + offset * 118,' not in app:
    raise SystemExit('Services card spacing value not found')
app = app.replace('-50 + offset * 118,', '-50 + offset * 100,', 1)

old_scale = '''        const scale = Math.max(
          0.68,
          1 - distance * 0.17,
        )'''
new_scale = '''        const scale = Math.max(
          0.76,
          1 - distance * 0.08,
        )'''
if old_scale not in app:
    raise SystemExit('Services card scale block not found')
app = app.replace(old_scale, new_scale, 1)

marker = '/* ===== SERVICES REFERENCE REDESIGN V3 ===== */'
if marker not in css:
    css += '''

/* ===== SERVICES REFERENCE REDESIGN V3 ===== */
.portfolio-page .carousel-interface {
  background: radial-gradient(circle at 58% 48%, rgba(255,255,255,.025), transparent 27%), #030303;
}

.portfolio-page .carousel-interface::after {
  background: linear-gradient(90deg, rgba(3,3,3,.99) 0%, rgba(3,3,3,.92) 20%, rgba(3,3,3,.34) 37%, rgba(3,3,3,.04) 64%, rgba(3,3,3,.16) 100%);
}

.portfolio-page .carousel-heading {
  top: clamp(8.9rem, 22vh, 11rem);
  left: var(--page-gutter);
  width: min(25rem, 29vw);
}

.portfolio-page .carousel-heading p {
  margin: 0 0 1.25rem;
  color: rgba(255,255,255,.72);
  font-size: .64rem;
  font-weight: 720;
  letter-spacing: .32em;
}

.portfolio-page .carousel-heading h2 {
  max-width: 23rem;
  margin: 0;
  font-size: clamp(3.4rem, 4.55vw, 4.6rem);
  font-weight: 780;
  line-height: 1.03;
  letter-spacing: -.055em;
}

.services-intro {
  display: block;
  max-width: 23rem;
  margin-top: 1.55rem;
  color: rgba(255,255,255,.72);
  font-size: clamp(.92rem, 1.18vw, 1.08rem);
  line-height: 1.48;
}

.services-contact-button {
  min-width: 12.8rem;
  min-height: 3.2rem;
  margin-top: 1.25rem;
  padding: .72rem 1.15rem;
  justify-content: flex-start;
  gap: .72rem;
  border-color: rgba(255,255,255,.64);
  border-radius: .72rem;
  background: rgba(255,255,255,.018);
  font-size: .96rem;
  font-weight: 520;
}

.services-contact-button > span:last-child {
  margin-left: auto;
  font-size: 1.2rem;
}

.services-contact-icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.portfolio-page .carousel-viewport {
  inset: 0 0 0 16%;
  perspective: 1900px;
  perspective-origin: 57% 50%;
}

.portfolio-page .carousel-card {
  width: clamp(33rem, 38vw, 38rem);
  height: clamp(25rem, 68svh, 29rem);
  border-radius: 2rem;
  border-color: rgba(255,255,255,.24);
  box-shadow: 0 34px 100px rgba(0,0,0,.62), inset 0 1px 0 rgba(255,255,255,.08);
}

.portfolio-page .carousel-card.is-active {
  border-color: rgba(255,255,255,.62);
  box-shadow: 0 42px 120px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.12);
}

.portfolio-page .carousel-card-content {
  right: 1.6rem;
  bottom: 1.7rem;
  left: 1.6rem;
}

.portfolio-page .carousel-card-content h3 {
  font-size: clamp(1.8rem, 2.25vw, 2.35rem);
}

.portfolio-page .carousel-active-copy,
.portfolio-page .carousel-scroll-note {
  display: none;
}

.services-scroll-cue {
  position: absolute;
  bottom: 1.8rem;
  left: var(--page-gutter);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: .8rem;
  color: rgba(255,255,255,.7);
  pointer-events: none;
}

.services-scroll-cue > span {
  display: grid;
  place-items: center;
  width: 2.45rem;
  height: 2.45rem;
  border: 1px solid rgba(255,255,255,.24);
  border-radius: 50%;
  font-size: 1.15rem;
}

.services-scroll-cue small {
  font-size: .76rem;
}

.services-card-nav {
  position: absolute;
  right: var(--page-gutter);
  bottom: 1.8rem;
  z-index: 60;
  display: flex;
  gap: .75rem;
  pointer-events: auto;
}

.services-card-nav button {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid rgba(255,255,255,.34);
  border-radius: 50%;
  color: rgba(255,255,255,.9);
  background: rgba(4,4,4,.2);
  font: inherit;
  font-size: 1.15rem;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease;
}

.services-card-nav button:hover {
  border-color: rgba(255,255,255,.9);
  background: rgba(255,255,255,.08);
}

@media (max-width: 1120px) and (min-width: 821px) {
  .portfolio-page .carousel-heading { width: min(21rem, 30vw); }
  .portfolio-page .carousel-heading h2 { font-size: clamp(3rem, 4.7vw, 4rem); }
  .portfolio-page .carousel-card {
    width: clamp(29rem, 39vw, 34rem);
    height: clamp(23rem, 62svh, 26rem);
  }
}

@media (max-width: 820px) {
  .portfolio-page .carousel-heading {
    top: 5.8rem;
    left: 1rem;
    width: calc(100% - 2rem);
  }
  .portfolio-page .carousel-heading p { margin-bottom: .75rem; }
  .portfolio-page .carousel-heading h2 {
    max-width: 16rem;
    font-size: clamp(2.55rem, 12vw, 3.9rem);
    line-height: .98;
  }
  .services-intro {
    max-width: 26rem;
    margin-top: .85rem;
    font-size: .82rem;
  }
  .services-contact-button {
    min-width: 11.5rem;
    min-height: 2.8rem;
    margin-top: .85rem;
    font-size: .82rem;
  }
  .portfolio-page .carousel-viewport {
    inset: 18rem 0 5.7rem;
    perspective: 1200px;
  }
  .portfolio-page .carousel-card {
    width: min(86vw, 31rem);
    height: auto;
    aspect-ratio: 1.31 / 1;
    border-radius: 1.35rem;
  }
  .services-scroll-cue { display: none; }
  .services-card-nav {
    right: 1rem;
    bottom: 1rem;
  }
  .services-card-nav button {
    width: 2.35rem;
    height: 2.35rem;
  }
}
/* ===== SERVICES REFERENCE REDESIGN V3: END ===== */
'''

app_path.write_text(app)
css_path.write_text(css)
