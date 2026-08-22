import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './WebsitesPage.css'
import './WebsiteCoverOverrides.css'

// Portfolio deployment sync marker: Nightfall + Froid + ShayTax website cards
const FROID_SITE_URL = 'https://froid-clothing-platform-github-d98tx2k50.vercel.app/'
const FROID_COVER_URL = '/assets/websites/froid-cover.png'
const NIGHTFALL_SITE_URL = 'https://nightfall-unlocked-vercel-drop.vercel.app/'
const NIGHTFALL_COVER_URL = 'https://at.adobe.com/SReDrxpeweBwgCfL'
const SHAYTAX_SITE_URL = 'https://shaytaxdemo.vercel.app/'
const SHAYTAX_COVER_URL = '/assets/websites/shaytax-cover.png'
const WEBSITES_BACKGROUND_URL = '/assets/websites/atlanta-background.png'

const websiteCollections = [
  {
    id: 'my-list',
    title: 'My List',
    description: 'All one-page website experiences.',
    projects: [
      ['Froid', 'Playable', '#a9e4ff', '#102c64', 'froid', FROID_COVER_URL, FROID_SITE_URL],
      ['Nightfall', 'Playable', '#d94c5f', '#180b1a', 'nightfall', NIGHTFALL_COVER_URL, NIGHTFALL_SITE_URL],
      ['ShayTax', 'Service', '#3aa8ff', '#061735', null, SHAYTAX_COVER_URL, SHAYTAX_SITE_URL],
      ['Designer Site 01', 'Designer', '#b58cff', '#321451'],
      ['Service Site 02', 'Service', '#71e0b4', '#103f43'],
      ['Playable Site 02', 'Playable', '#ffd35f', '#682e16'],
      ['Designer Site 02', 'Designer', '#ff79b7', '#4f153d'],
    ],
  },
  {
    id: 'service',
    title: 'Service',
    description: 'Conversion-focused sites built to explain, persuade, and connect.',
    projects: [
      ['ShayTax', 'Service', '#3aa8ff', '#061735', null, SHAYTAX_COVER_URL, SHAYTAX_SITE_URL],
      ['Service Site 01', 'Service', '#65d7ff', '#102c64'],
      ['Service Site 02', 'Service', '#71e0b4', '#103f43'],
      ['Service Site 03', 'Service', '#ffbd73', '#5b2c20'],
    ],
  },
  {
    id: 'playable',
    title: 'Playable',
    description: 'Interactive experiences designed around motion, discovery, and play.',
    projects: [
      ['Froid', 'Playable', '#a9e4ff', '#102c64', 'froid', FROID_COVER_URL, FROID_SITE_URL],
      ['Nightfall', 'Playable', '#d94c5f', '#180b1a', 'nightfall', NIGHTFALL_COVER_URL, NIGHTFALL_SITE_URL],
      ['Playable Site 03', 'Playable', '#74d8ff', '#18325f'],
    ],
  },
  {
    id: 'designer',
    title: 'Designer',
    description: 'Visual-first portfolio sites where craft and personality lead.',
    projects: [
      ['Designer Site 01', 'Designer', '#b58cff', '#321451'],
      ['Designer Site 02', 'Designer', '#ff79b7', '#4f153d'],
      ['Designer Site 03', 'Designer', '#9af0e2', '#174744'],
    ],
  },
]

function WebsiteCover({ project, index, onOpenProject }) {
  const [title, category, accent, depth, slug, thumbnail, externalUrl] = project
  const interactive = Boolean(slug || externalUrl)

  const openProject = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (slug) onOpenProject?.(slug)
  }

  return (
    <article
      className="website-cover"
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={openProject}
      onKeyDown={(event) => {
        if (interactive && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          openProject()
        }
      }}
      style={{
        '--website-accent': accent,
        '--website-depth': depth,
      }}
    >
      <div className="website-cover-art" aria-hidden="true">
        {thumbnail ? (
          <img src={thumbnail} alt="" />
        ) : (
          <>
            <span />
            <i />
          </>
        )}
        <b>{String(index + 1).padStart(2, '0')}</b>
      </div>

      <div className="website-cover-copy">
        <small>{category}</small>
        <strong>{title}</strong>
        <span>
          {externalUrl
            ? 'Visit live site ↗'
            : slug
              ? 'View one-page experience ↗'
              : 'One-page experience · Coming soon'}
        </span>
      </div>
    </article>
  )
}

export default function WebsitesPage({ open, onClose, onOpenProject }) {
  const [activeCollectionId, setActiveCollectionId] = useState('my-list')

  useEffect(() => {
    if (open) setActiveCollectionId('my-list')
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const oldHtmlOverflow = document.documentElement.style.overflow
    const oldBodyOverflow = document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.documentElement.style.overflow = oldHtmlOverflow
      document.body.style.overflow = oldBodyOverflow
    }
  }, [onClose, open])

  if (!open) return null

  const activeCollection = websiteCollections.find(
    (collection) => collection.id === activeCollectionId,
  ) ?? websiteCollections[0]

  const openContact = () => {
    onClose()

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.querySelector('.header-cta')?.click()
      })
    })
  }

  return createPortal(
    <section
      className="websites-page"
      role="dialog"
      aria-modal="true"
      aria-label="Website Design and Development"
    >
      <div className="websites-scroll">
        <header className="websites-hero">
          <img
            src={WEBSITES_BACKGROUND_URL}
            alt="Atlanta skyline at sunset"
          />

          <div className="websites-hero-shade" aria-hidden="true" />

          <nav className="websites-nav" aria-label="Website categories">
            {websiteCollections.map((collection) => (
              <button
                className={activeCollectionId === collection.id ? 'is-active' : ''}
                type="button"
                key={collection.id}
                onClick={() => setActiveCollectionId(collection.id)}
              >
                {collection.title}
              </button>
            ))}
          </nav>

          <button
            className="websites-close"
            type="button"
            aria-label="Close Websites collection"
            onClick={onClose}
          >
            <i />
            <i />
          </button>

          <div className="websites-hero-copy">
            <p>John Wolf / Digital Experiences</p>
            <h1>
              Website Design
              <br />
              &amp; Development
            </h1>

            <span>
              Cinematic one-page sites built to turn an idea into an experience.
            </span>

            <div className="websites-actions">
              <button type="button" onClick={openContact}>Contact</button>
              <a href="#mobile-my-list" aria-label="Explore website projects">↓</a>
            </div>
          </div>

          <section className="websites-desktop-showcase" aria-live="polite">
            <div className="website-collection-heading">
              <div>
                <p>{activeCollection.title}</p>
                <span>{activeCollection.description}</span>
              </div>

              <small>Drag or scroll to explore</small>
            </div>

            <div className="website-cover-rail">
              {activeCollection.projects.map((project, index) => (
                <WebsiteCover
                  project={project}
                  index={index}
                  onOpenProject={onOpenProject}
                  key={`${activeCollection.id}-${project[0]}`}
                />
              ))}
            </div>
          </section>
        </header>

        <div className="website-collections website-collections-mobile">
          {websiteCollections.map((collection) => (
            <section
              className="website-collection"
              id={`mobile-${collection.id}`}
              key={collection.id}
            >
              <div className="website-collection-heading">
                <div>
                  <p>{collection.title}</p>
                  <span>{collection.description}</span>
                </div>

                <small>Drag or scroll to explore</small>
              </div>

              <div className="website-cover-rail">
                {collection.projects.map((project, index) => (
                  <WebsiteCover
                    project={project}
                    index={index}
                    onOpenProject={onOpenProject}
                    key={`${collection.id}-${project[0]}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>,
    document.body,
  )
}
