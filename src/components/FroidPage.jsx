import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './FroidPage.css'

const froidProducts = [
  ['Glacier', 'Blue faux-fur crop', 'jacket-blue-fur.webp', '01'],
  ['Signal', 'High-gloss puffer', 'jacket-red.webp', '02'],
  ['Violet Ice', 'High-gloss crop', 'jacket-lilac.webp', '03'],
  ['Deep Freeze', 'Cobalt puffer', 'jacket-blue.webp', '04'],
  ['Solar Flare', 'Orange gloss crop', 'jacket-orange.webp', '05'],
  ['Polar Shift', 'Technical shell', 'jacket-mint.webp', '06'],
  ['Storm', 'Technical winter jacket', 'jacket-technical-gray.webp', '07'],
  ['Midnight Fur', 'Gray faux-fur crop', 'jacket-gray-fur.webp', '08'],
]

const asset = (name) => `/assets/froid/cutouts/${name}`

export default function FroidPage({ open, onClose }) {
  const [activeProduct, setActiveProduct] = useState(0)

  useEffect(() => {
    if (!open) return undefined

    setActiveProduct(0)
    const oldHtmlOverflow = document.documentElement.style.overflow
    const oldBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        setActiveProduct((current) => (current + 1) % froidProducts.length)
      }
      if (event.key === 'ArrowLeft') {
        setActiveProduct((current) => (current - 1 + froidProducts.length) % froidProducts.length)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.documentElement.style.overflow = oldHtmlOverflow
      document.body.style.overflow = oldBodyOverflow
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <main className="froid-page" role="dialog" aria-modal="true" aria-label="Froid clothing collection">
      <div className="froid-scroll">
        <nav className="froid-nav" aria-label="Froid navigation">
          <img src={asset('froid-ice-logo.webp')} alt="Froid" />
          <div>
            <a href="#froid-drop">The Drop</a>
            <a href="#froid-collection">Collection</a>
            <a href="#froid-story">Cold Code</a>
          </div>
          <button type="button" onClick={onClose} aria-label="Return to website collection">Close <span>×</span></button>
        </nav>

        <section className="froid-hero" id="froid-drop">
          <img className="froid-hero-background" src="/assets/froid/background-mountain.webp" alt="" />
          <div className="froid-noise" aria-hidden="true" />
          <p className="froid-kicker">Froid / Winter System 01</p>
          <h1>Cold is a<br />state of mind.</h1>
          <p className="froid-intro">Built for the moment everything else goes quiet. Statement outerwear engineered for impact.</p>
          <a className="froid-enter" href="#froid-collection">Enter the cold <span>↓</span></a>
          <img className="froid-hero-model" src={asset('model-meditation.webp')} alt="Model wearing Froid gray fur outerwear" />
          <div className="froid-temperature" aria-hidden="true"><span>−18°</span><small>ATL / 33.7490 N</small></div>
          <div className="froid-hero-word" aria-hidden="true">FROID</div>
        </section>

        <section className="froid-collection" id="froid-collection">
          <header>
            <div><small>01 / Inventory</small><h2>The cold drop.</h2></div>
            <p>Eight silhouettes. One temperature. Select a piece to bring it into focus.</p>
          </header>

          <div className="froid-product-stage">
            <div className="froid-selected-copy">
              <small>{froidProducts[activeProduct][3]} / 08</small>
              <h3>{froidProducts[activeProduct][0]}</h3>
              <p>{froidProducts[activeProduct][1]}</p>
              <span>Concept garment · Froid archive</span>
            </div>
            <img
              key={froidProducts[activeProduct][2]}
              src={asset(froidProducts[activeProduct][2])}
              alt={`${froidProducts[activeProduct][0]} jacket`}
            />
            <strong aria-hidden="true">{froidProducts[activeProduct][3]}</strong>
          </div>

          <div className="froid-product-rail" aria-label="Choose a Froid garment">
            {froidProducts.map((product, index) => (
              <button
                type="button"
                className={activeProduct === index ? 'is-active' : ''}
                onClick={() => setActiveProduct(index)}
                key={product[0]}
              >
                <span>{product[3]}</span>
                <img src={asset(product[2])} alt="" />
                <strong>{product[0]}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="froid-editorial" id="froid-story">
          <img src="/assets/froid/froid-editorial.webp" alt="Froid ice editorial featuring the collection" />
          <div>
            <small>02 / Cold Code</small>
            <h2>You don’t feel cold.<br />You feel less.</h2>
            <p>Froid lives between protection and provocation—oversized volume, frozen color, and silhouettes that refuse to disappear.</p>
          </div>
        </section>

        <section className="froid-finale">
          <img className="froid-laying" src={asset('model-laying.webp')} alt="Froid model reclining in gray fur outerwear" />
          <img className="froid-squatting" src={asset('model-squatting.webp')} alt="Froid model in a top-down pose" />
          <p>Designed below zero.</p>
          <h2>Freeze the noise.</h2>
          <button type="button" onClick={onClose}>Return to collection <span>↗</span></button>
        </section>
      </div>
    </main>,
    document.body,
  )
}
