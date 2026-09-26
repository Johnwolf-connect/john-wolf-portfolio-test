import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import Lenis from 'lenis'
import ExpertiseIcon from './components/ExpertiseIcon.jsx'
import BrandVault from './components/BrandVault.jsx'
import WebsitesPage from './components/WebsitesPage.jsx'
import FroidPage from './components/FroidPage.jsx'

gsap.registerPlugin(ScrollTrigger, Draggable)

const navigation = ['Home', 'Services', 'About', 'Contact']

/* ===== ACTIVE NAVIGATION SYSTEM ===== */

const navigationTargets = {
  Home: '#home',
  Services: '#services',
  About: '#about',
  Contact: '#contact',
}

const BRAND_GUIDELINES_HASH = '#brand-guidelines'
const WEBSITES_HASH = '#websites'
const FROID_HASH = '#froid'

const expertise = [
  {
    icon: 'identity',
    title: 'Brand Identity',
    body: 'Distinctive logos, typography, color systems, and visual standards built for recognition.',
  },
  {
    icon: 'digital',
    title: 'Digital Experiences',
    body: 'Purposeful websites and interactive visuals shaped through design, motion, and usability.',
  },
  {
    icon: 'campaign',
    title: 'Campaign Creative',
    body: 'Launch graphics, advertisements, and social content designed to command attention.',
  },
  {
    icon: 'partnership',
    title: 'Creative Partnership',
    body: 'Thoughtful design support from the first strategic idea through polished final delivery.',
  },
]

const carouselCards = [
  {
    title: 'Logos',
    eyebrow: 'Identity marks',
    description: 'Distinctive symbols and signature systems made to be remembered.',
    video: '/assets/carousel/packaging.mp4',
    poster: '/assets/carousel/packaging.jpg',
  },
  {
    title: 'Brand Guidelines',
    eyebrow: 'Visual systems',
    description: 'Rules that keep every brand expression clear, consistent, and recognizable.',
    video: '/assets/carousel/brand-guidelines.mp4',
    poster: '/assets/carousel/brand-guidelines.jpg',
  },
  {
    title: 'Websites',
    eyebrow: 'Digital experiences',
    description: 'Immersive interfaces that turn strong ideas into intuitive experiences.',
    video: '/assets/carousel/websites.mp4',
    poster: '/assets/carousel/websites.jpg',
  },
  {
    title: 'Illustrations',
    eyebrow: 'Custom artwork',
    description: 'Original visuals built to give campaigns and stories their own character.',
    video: '/assets/carousel/illustrations.mp4',
    poster: '/assets/carousel/illustrations.jpg',
  },
]

/* ===== BRAND GUIDELINES PROJECT CAROUSEL ===== */

const brandGuidelineProjects = [
  {
    title: 'Riches Cosmetics',
    category: 'Luxury cosmetics identity',
    description:
      'A 27-page confidence-led identity system built around control, restraint, clarity, and quiet visual authority.',
    image:
      '/assets/brand-guidelines/projects/riches-cosmetics-cover.jpg',
    pdf:
      '/assets/brand-guidelines/projects/riches-cosmetics-brand-guidelines.pdf',
    pages: 27,
  },
  {
    title: 'Chick Muy Caliente',
    category: 'Food brand identity',
    description:
      'A bold 17-page system covering brand essence, mascot use, voice, typography, color, heat levels, imagery, and iconography.',
    image:
      '/assets/brand-guidelines/projects/chick-muy-caliente-cover.jpg',
    pdf:
      '/assets/brand-guidelines/projects/chick-muy-caliente-brand-guidelines.pdf',
    pages: 17,
  },
]

function getBrandProjectOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  const halfway = total / 2

  if (offset > halfway) {
    offset -= total
  }

  if (offset < -halfway) {
    offset += total
  }

  return offset
}

function scrollToSection(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getArchiveOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  const halfway = total / 2

  if (offset > halfway) offset -= total
  if (offset < -halfway) offset += total

  return offset
}


function buildArchiveSeamlessLoop(items, spacing, animateFunc) {
  const overlap = Math.ceil(1 / spacing)
  const startTime = items.length * spacing + 0.5
  const loopTime =
    (items.length + overlap) * spacing + 1

  const rawSequence = gsap.timeline({
    paused: true,
  })

  const seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      if (this._time === this._dur) {
        this._tTime += this._dur - 0.01
      }
    },
  })

  const total = items.length + overlap * 2

  for (let i = 0; i < total; i += 1) {
    const index = i % items.length
    const time = i * spacing

    rawSequence.add(
      animateFunc(items[index]),
      time,
    )
  }

  rawSequence.time(startTime)

  seamlessLoop
    .to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: 'none',
    })
    .fromTo(
      rawSequence,
      {
        time: overlap * spacing + 1,
      },
      {
        time: startTime,
        duration:
          startTime -
          (overlap * spacing + 1),
        immediateRender: false,
        ease: 'none',
      },
    )

  return seamlessLoop
}

export default function App() {
  const root = useRef(null)
  const experience = useRef(null)
  const stickyStage = useRef(null)
  const portfolioStage = useRef(null)
  const archiveLoopApi = useRef(null)
  const archiveWheelLocked = useRef(false)
  const heroVideo = useRef(null)
  const homeCardVideo = useRef(null)
  const brandPageStage = useRef(null)
  const brandPageOriginVideo = useRef(null)
  const brandPageBackgroundVideo = useRef(null)
  const brandPageOrigin = useRef(null)
  const brandPageOriginTime = useRef(0)
  const brandPageTouchStart = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeNavigation, setActiveNavigation] = useState('Home')
  const [videoReady, setVideoReady] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const [brandPageOpen, setBrandPageOpen] = useState(false)
  const [websitesPageOpen, setWebsitesPageOpen] = useState(false)
  const [froidPageOpen, setFroidPageOpen] = useState(false)
  const [brandVaultOpen, setBrandVaultOpen] = useState(false)
  const [brandProjectIndex, setBrandProjectIndex] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)
  const contactReturnY = useRef(0)
  const contactReturnNavigation = useRef('About')

  const activeBrandProject =
    brandGuidelineProjects[brandProjectIndex]

  /* ===== BRAND GUIDELINES PAGE FOUNDATION ===== */

  const openBrandGuidelines = (event) => {
    const card = event?.currentTarget
    const rect = card?.getBoundingClientRect()
    const video = card?.querySelector('video')

    brandPageOrigin.current = {
      top: rect?.top ?? 0,
      left: rect?.left ?? 0,
      width: rect?.width ?? window.innerWidth,
      height: rect?.height ?? window.innerHeight,
    }

    brandPageOriginTime.current =
      video && Number.isFinite(video.currentTime)
        ? video.currentTime
        : 0

    setBrandVaultOpen(false)
    setWebsitesPageOpen(false)
    setFroidPageOpen(false)
    setBrandProjectIndex(0)
    setActiveNavigation('Services')
    setBrandPageOpen(true)

    if (window.location.hash !== BRAND_GUIDELINES_HASH) {
      window.history.pushState(
        { section: 'Brand Guidelines' },
        '',
        BRAND_GUIDELINES_HASH,
      )
    }
  }

  const openWebsitesPage = () => {
    setBrandVaultOpen(false)
    setBrandPageOpen(false)
    setActiveNavigation('Services')
    setWebsitesPageOpen(true)
    setFroidPageOpen(false)

    if (window.location.hash !== WEBSITES_HASH) {
      window.history.pushState(
        { section: 'Websites' },
        '',
        WEBSITES_HASH,
      )
    }
  }

  const openFroidPage = () => {
    setBrandVaultOpen(false)
    setBrandPageOpen(false)
    setWebsitesPageOpen(false)
    setFroidPageOpen(true)
    setActiveNavigation('Services')

    if (window.location.hash !== FROID_HASH) {
      window.history.pushState({ section: 'Froid' }, '', FROID_HASH)
    }
  }

  const closeFroidPage = () => {
    setFroidPageOpen(false)
    setWebsitesPageOpen(true)
    window.history.replaceState({ section: 'Websites' }, '', WEBSITES_HASH)
  }

  const closeWebsitesPage = () => {
    setWebsitesPageOpen(false)

    if (window.location.hash === WEBSITES_HASH) {
      window.history.replaceState(
        { section: 'Services' },
        '',
        '#services',
      )
    }
  }


  /*
    The active Logos card is duplicated at its exact viewport
    position, expands to full screen, and hands its playing
    video to the standalone 3D Logos page.
  */
  const openLogosPage = (event) => {
    const card = event.currentTarget

    if (
      !card ||
      card.dataset.logoTransitioning === 'true'
    ) {
      return
    }

    const rect = card.getBoundingClientRect()
    const cardVideo = card.querySelector('video')

    const startingTime =
      cardVideo &&
      Number.isFinite(cardVideo.currentTime)
        ? cardVideo.currentTime
        : 0

    card.dataset.logoTransitioning = 'true'

    const overlay = document.createElement('div')
    overlay.className = 'logos-page-transition'
    overlay.setAttribute('aria-hidden', 'true')

    const transitionVideo =
      document.createElement('video')

    transitionVideo.className =
      'logos-page-transition-video'

    transitionVideo.muted = true
    transitionVideo.loop = true
    transitionVideo.autoplay = true
    transitionVideo.playsInline = true
    transitionVideo.poster =
      '/assets/carousel/packaging.jpg'

    const transitionSource =
      document.createElement('source')

    transitionSource.src =
      '/assets/carousel/packaging.mp4'

    transitionSource.type = 'video/mp4'

    transitionVideo.appendChild(transitionSource)

    const shade = document.createElement('div')
    shade.className = 'logos-page-transition-shade'

    const copy = document.createElement('div')
    copy.className = 'logos-page-transition-copy'

    copy.innerHTML = `
      <p>Identity marks</p>
      <h3>Logos</h3>
      <span>Entering collection ↗</span>
    `

    overlay.append(
      transitionVideo,
      shade,
      copy,
    )

    document.body.appendChild(overlay)

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const syncTransitionVideo = () => {
      try {
        if (
          Number.isFinite(startingTime) &&
          startingTime >= 0
        ) {
          transitionVideo.currentTime =
            startingTime
        }
      } catch {
        // The poster remains until seeking is available.
      }

      transitionVideo.play().catch(() => {})
    }

    if (transitionVideo.readyState >= 1) {
      syncTransitionVideo()
    } else {
      transitionVideo.addEventListener(
        'loadedmetadata',
        syncTransitionVideo,
        { once: true },
      )
    }

    gsap.set(overlay, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: '1.45rem',
      borderColor:
        'rgba(255,255,255,.58)',
      boxShadow:
        '0 38px 110px rgba(0,0,0,.72), 0 0 52px rgba(121,74,255,.12)',
    })

    const enterLogosPage = () => {
      const currentTime =
        Number.isFinite(transitionVideo.currentTime)
          ? transitionVideo.currentTime
          : startingTime

      window.sessionStorage.setItem(
        'logosBackgroundTime',
        String(currentTime),
      )

      window.location.assign('/ring-lab.html')
    }

    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (reduceMotion) {
      gsap.set(overlay, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
      })

      enterLogosPage()
      return
    }

    gsap
      .timeline({
        onComplete: enterLogosPage,
      })
      .to(
        copy,
        {
          opacity: 0,
          y: 24,
          duration: 0.38,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        shade,
        {
          opacity: 0.34,
          duration: 0.62,
          ease: 'power2.out',
        },
        0.08,
      )
      .to(
        overlay,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          borderColor:
            'rgba(255,255,255,0)',
          boxShadow:
            '0 0 0 rgba(0,0,0,0)',
          duration: 1.05,
          ease:
            'power4.inOut',
        },
        0,
      )
  }

  const navigateToSection = (
  item,
  closeBrandPage = false,
) => {
  if (item === 'Contact') {
    setMenuOpen(false)
    contactReturnY.current = window.scrollY
    contactReturnNavigation.current = activeNavigation

    const showContactExperience = () => {
      setActiveNavigation('Contact')
      setContactOpen(true)
    }

    if (
      closeBrandPage &&
      (brandPageOpen || websitesPageOpen || froidPageOpen)
    ) {
      setBrandPageOpen(false)
      setWebsitesPageOpen(false)
      setFroidPageOpen(false)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(showContactExperience)
      })
      return
    }

    showContactExperience()
    return
  }

  const target = navigationTargets[item]

  if (!target) return

    setActiveNavigation(item)
    setMenuOpen(false)

    const completeNavigation = () => {
      scrollToSection(target)

      if (window.location.hash !== target) {
        window.history.pushState(
          { section: item },
          '',
          target,
        )
      } else {
        window.history.replaceState(
          { section: item },
          '',
          target,
        )
      }
    }

    if (closeBrandPage && (brandPageOpen || websitesPageOpen || froidPageOpen)) {
      setBrandPageOpen(false)
      setWebsitesPageOpen(false)
      setFroidPageOpen(false)

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(
          completeNavigation,
        )
      })

      return
    }

    completeNavigation()
  }

  useEffect(() => {
    const syncNavigationFromLocation = () => {
      if (
        window.location.hash ===
        BRAND_GUIDELINES_HASH
      ) {
        if (!brandPageOrigin.current) {
          brandPageOrigin.current = {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        }

        setActiveNavigation('Services')
        setWebsitesPageOpen(false)
        setFroidPageOpen(false)
        setBrandPageOpen(true)
        return
      }

      if (window.location.hash === WEBSITES_HASH) {
        setActiveNavigation('Services')
        setBrandPageOpen(false)
        setWebsitesPageOpen(true)
        setFroidPageOpen(false)
        return
      }

      if (window.location.hash === FROID_HASH) {
        setActiveNavigation('Services')
        setBrandPageOpen(false)
        setWebsitesPageOpen(false)
        setFroidPageOpen(true)
        return
      }

      setBrandPageOpen(false)
      setWebsitesPageOpen(false)
      setFroidPageOpen(false)

      const matchingItem = navigation.find(
        (item) =>
          navigationTargets[item] ===
          window.location.hash,
      )

      if (matchingItem) {
        setActiveNavigation(matchingItem)
      }
    }

    syncNavigationFromLocation()

    window.addEventListener(
      'hashchange',
      syncNavigationFromLocation,
    )

    window.addEventListener(
      'popstate',
      syncNavigationFromLocation,
    )

    return () => {
      window.removeEventListener(
        'hashchange',
        syncNavigationFromLocation,
      )

      window.removeEventListener(
        'popstate',
        syncNavigationFromLocation,
      )
    }
  }, [])

  useEffect(() => {
    let animationFrame = null

    const updateActiveNavigation = () => {
      if (brandPageOpen || websitesPageOpen || froidPageOpen) {
        setActiveNavigation('Services')
        return
      }

      const laterSections = [
        'Contact',
        'About',
      ]

      const visibleLaterSection =
        laterSections.find((item) => {
          const section = document.querySelector(
            navigationTargets[item],
          )

          if (!section) return false

          return (
            section.getBoundingClientRect().top <=
            120
          )
        })

      if (visibleLaterSection) {
        setActiveNavigation(
          (current) =>
            current === visibleLaterSection
              ? current
              : visibleLaterSection,
        )

        return
      }

      const servicesSection =
        document.querySelector('#services')

      const experienceSection =
        servicesSection &&
        servicesSection.getBoundingClientRect().top <=
          120
          ? 'Services'
          : 'Home'

      setActiveNavigation(
        (current) =>
          current === experienceSection
            ? current
            : experienceSection,
      )
    }

    const requestNavigationUpdate = () => {
      if (animationFrame !== null) return

      animationFrame =
        window.requestAnimationFrame(() => {
          animationFrame = null
          updateActiveNavigation()
        })
    }

    updateActiveNavigation()

    window.addEventListener(
      'scroll',
      requestNavigationUpdate,
      { passive: true },
    )

    window.addEventListener(
      'resize',
      requestNavigationUpdate,
    )

    return () => {
      window.removeEventListener(
        'scroll',
        requestNavigationUpdate,
      )

      window.removeEventListener(
        'resize',
        requestNavigationUpdate,
      )

      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        )
      }
    }
  }, [activeCard, brandPageOpen, websitesPageOpen, froidPageOpen])

  useEffect(() => {
  if (!contactOpen) return undefined

  const previousHtmlOverflow =
    document.documentElement.style.overflow
  const previousBodyOverflow =
    document.body.style.overflow

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  const overlay = document.querySelector(
    '.contact-experience',
  )

  if (overlay) {
    gsap.fromTo(
      overlay,
      {
        opacity: 0,
        y: 34,
        scale: 0.985,
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.72,
        ease: 'power3.out',
      },
    )
  }

  const closeContactExperience = () => {
    setContactOpen(false)
    setActiveNavigation(
      contactReturnNavigation.current,
    )

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: contactReturnY.current,
        behavior: 'auto',
      })
    })
  }

  const handleContactEscape = (event) => {
    if (event.key === 'Escape') {
      closeContactExperience()
    }
  }

  window.addEventListener(
    'keydown',
    handleContactEscape,
  )

  return () => {
    window.removeEventListener(
      'keydown',
      handleContactEscape,
    )
    document.documentElement.style.overflow =
      previousHtmlOverflow
    document.body.style.overflow =
      previousBodyOverflow
  }
}, [contactOpen])

useEffect(() => {
  let touchStartY = null
  let triggerLocked = false

  const isAtAboutEnd = () => {
    const about = document.querySelector('#about')
    if (!about) return false

    const rect = about.getBoundingClientRect()
    const atDocumentEnd =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4

    return (
      atDocumentEnd &&
      rect.bottom <= window.innerHeight + 6
    )
  }

  const openFromAboutEnd = () => {
    if (
      triggerLocked ||
      contactOpen ||
      brandPageOpen ||
      websitesPageOpen ||
      froidPageOpen ||
      !isAtAboutEnd()
    ) {
      return
    }

    triggerLocked = true
    setActiveNavigation('Contact')

    const startProject =
      window.__johnWolfStartProjectTransition

    if (startProject?.open) {
      startProject.open()
    }

    window.setTimeout(() => {
      triggerLocked = false
    }, 650)
  }

  const handleWheel = (event) => {
    if (event.deltaY > 12) openFromAboutEnd()
  }

  const handleTouchStart = (event) => {
    touchStartY = event.touches?.[0]?.clientY ?? null
  }

  const handleTouchEnd = (event) => {
    const endY = event.changedTouches?.[0]?.clientY
    if (
      touchStartY !== null &&
      Number.isFinite(endY) &&
      touchStartY - endY > 34
    ) {
      openFromAboutEnd()
    }
    touchStartY = null
  }

  const handleEndKey = (event) => {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      event.key === ' '
    ) {
      openFromAboutEnd()
    }
  }

  window.addEventListener('wheel', handleWheel, { passive: true })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
  window.addEventListener('keydown', handleEndKey)

  return () => {
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('keydown', handleEndKey)
  }
}, [
  contactOpen,
  brandPageOpen,
  websitesPageOpen,
  froidPageOpen,
])

  useEffect(() => {
    if (!brandPageOpen) return undefined

    const oldHtmlOverflow =
      document.documentElement.style.overflow
    const oldBodyOverflow =
      document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setBrandPageOpen(false)

        if (
          window.location.hash ===
          BRAND_GUIDELINES_HASH
        ) {
          window.history.replaceState(
            { section: 'Services' },
            '',
            '#services',
          )
        }
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)

      document.documentElement.style.overflow =
        oldHtmlOverflow

      document.body.style.overflow =
        oldBodyOverflow

      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }
  }, [brandPageOpen])

  /*
    Endless project navigation inside the opened Brand Guidelines page.
    This does not change the card-to-page opening animation.
  */
  useEffect(() => {
    if (!brandPageOpen || !brandPageStage.current) {
      return undefined
    }

    const stage = brandPageStage.current
    let wheelLocked = false
    let wheelTimer = null

    const moveProject = (direction) => {
      setBrandProjectIndex((current) => {
        const total = brandGuidelineProjects.length
        return (current + direction + total) % total
      })
    }

    const handleWheel = (event) => {
      event.preventDefault()

      if (
        wheelLocked ||
        Math.abs(event.deltaY) < 8
      ) {
        return
      }

      wheelLocked = true
      moveProject(event.deltaY > 0 ? 1 : -1)

      wheelTimer = window.setTimeout(() => {
        wheelLocked = false
      }, 470)
    }

    const handleProjectKeys = (event) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault()
        moveProject(1)
      }

      if (
        event.key === 'ArrowUp' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault()
        moveProject(-1)
      }
    }

    stage.addEventListener(
      'wheel',
      handleWheel,
      { passive: false },
    )

    window.addEventListener(
      'keydown',
      handleProjectKeys,
    )

    return () => {
      stage.removeEventListener(
        'wheel',
        handleWheel,
      )

      window.removeEventListener(
        'keydown',
        handleProjectKeys,
      )

      if (wheelTimer) {
        window.clearTimeout(wheelTimer)
      }
    }
  }, [brandPageOpen])

  /*
    The selected Brand Guidelines card is duplicated at its exact
    viewport rectangle and expands into the new full-screen page.
  */
  useLayoutEffect(() => {
    if (
      !brandPageOpen ||
      !brandPageStage.current ||
      !brandPageOrigin.current
    ) {
      return undefined
    }

    const stage = brandPageStage.current
    const originVideo = brandPageOriginVideo.current
    const backgroundVideo =
      brandPageBackgroundVideo.current
    const origin = brandPageOrigin.current

    if (originVideo) {
      try {
        originVideo.currentTime =
          brandPageOriginTime.current
      } catch {
        // Poster remains visible until metadata is available.
      }

      originVideo.play().catch(() => {})
    }

    if (backgroundVideo) {
      backgroundVideo.play().catch(() => {})
    }

    const context = gsap.context(() => {
      const cardCopy = stage.querySelector(
        '.brand-page-card-copy',
      )

      const cardShade = stage.querySelector(
        '.brand-page-card-shade',
      )

      const originLayer = stage.querySelector(
        '.brand-page-origin-video',
      )

      const backgroundLayer = stage.querySelector(
        '.brand-page-background-video',
      )

      const fadedOverlay = stage.querySelector(
        '.brand-page-faded-overlay',
      )

      const pageInterface = stage.querySelector(
        '.brand-page-interface',
      )

      gsap.set(stage, {
        top: origin.top,
        left: origin.left,
        width: origin.width,
        height: origin.height,
        borderRadius: '1.45rem',
        boxShadow:
          '0 38px 110px rgba(0,0,0,.72), 0 0 0 1px rgba(255,255,255,.22)',
      })

      gsap.set(backgroundLayer, {
        opacity: 0,
      })

      gsap.set(fadedOverlay, {
        opacity: 0,
      })

      gsap.set(pageInterface, {
        opacity: 0,
        y: 30,
      })

      const opening = gsap.timeline()

      opening
        .to(
          stage,
          {
            top: 0,
            left: 0,
            width: '100vw',
            height: '100svh',
            borderRadius: '0rem',
            boxShadow: '0 0 0 rgba(0,0,0,0)',
            duration: 1.2,
            ease: 'power4.inOut',
          },
          0,
        )
        .to(
          cardCopy,
          {
            opacity: 0,
            y: -22,
            duration: 0.34,
            ease: 'power2.in',
          },
          0.18,
        )
        .to(
          cardShade,
          {
            opacity: 0,
            duration: 0.52,
            ease: 'power2.inOut',
          },
          0.28,
        )
        .to(
          backgroundLayer,
          {
            opacity: 0.62,
            duration: 0.66,
            ease: 'power2.inOut',
          },
          0.48,
        )
        .to(
          originLayer,
          {
            opacity: 0,
            duration: 0.58,
            ease: 'power2.inOut',
          },
          0.55,
        )
        .to(
          fadedOverlay,
          {
            opacity: 1,
            duration: 0.54,
            ease: 'power2.out',
          },
          0.64,
        )
        .to(
          pageInterface,
          {
            opacity: 1,
            y: 0,
            duration: 0.68,
            ease: 'power3.out',
          },
          0.78,
        )
    }, stage)

    return () => {
      context.revert()
    }
  }, [brandPageOpen])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const lenis = new Lenis({
      duration: 1.08,
      smoothWheel: true,
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const update = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])


  useEffect(() => {
    const source = heroVideo.current
    const destination = homeCardVideo.current
    if (!source || !destination) return undefined

    const alignVideos = () => {
      if (Number.isFinite(source.currentTime) && Math.abs(destination.currentTime - source.currentTime) > 0.35) {
        destination.currentTime = source.currentTime
      }
      destination.play().catch(() => {})
    }

    source.addEventListener('playing', alignVideos)
    destination.addEventListener('canplay', alignVideos)
    alignVideos()

    return () => {
      source.removeEventListener('playing', alignVideos)
      destination.removeEventListener('canplay', alignVideos)
    }
  }, [videoReady])

  /* Active carousel video playback */
  useEffect(() => {
    const cardVideos = Array.from(
      root.current?.querySelectorAll('.carousel-card-video video') ?? [],
    )
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    cardVideos.forEach((video, index) => {
      const shouldPlay =
        !brandPageOpen &&
        !reduceMotion &&
        index === activeCard

      if (shouldPlay) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })

    return () => {
      cardVideos.forEach((video) => video.pause())
    }
  }, [activeCard, brandPageOpen])

  useLayoutEffect(() => {
    const stage = portfolioStage.current
    const section = stage?.closest('.portfolio-page')

    if (!stage || !section) return undefined

    const cards = gsap.utils.toArray(
      '.archive-seamless-card',
      stage,
    )

    const proxy = stage.querySelector(
      '.archive-drag-proxy',
    )

    if (!cards.length || !proxy) {
      return undefined
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const desktop = window.matchMedia(
      '(min-width: 821px)',
    ).matches

    let currentIndex = 0
    let scrollTrigger = null
    let dragStartX = 0

    const setCardState = (
      position,
      immediate = false,
    ) => {
      const boundedPosition = clamp(
        position,
        0,
        cards.length - 1,
      )

      const nextIndex = clamp(
        Math.round(boundedPosition),
        0,
        cards.length - 1,
      )

      if (nextIndex !== currentIndex) {
        currentIndex = nextIndex
        setActiveCard(nextIndex)
      }

      section.style.setProperty(
        '--services-progress',
        String(
          boundedPosition /
            Math.max(cards.length - 1, 1),
        ),
      )

      cards.forEach((card, index) => {
        const offset = index - boundedPosition
        const distance = Math.abs(offset)
        const visible = distance < 2.15
        const scale = Math.max(
          0.76,
          1 - distance * 0.08,
        )
        const opacity = visible
          ? Math.max(
              0.08,
              1 - distance * 0.56,
            )
          : 0

        const vars = {
          xPercent:
            -50 + offset * 100,
          yPercent:
            -50 + Math.min(distance, 2) * 2.4,
          scale,
          rotateY: clamp(
            offset * -4.5,
            -9,
            9,
          ),
          opacity,
          zIndex:
            100 - Math.round(distance * 12),
          filter: `brightness(${Math.max(
            0.58,
            1 - distance * 0.2,
          )}) saturate(${Math.max(
            0.72,
            1 - distance * 0.12,
          )})`,
          transformOrigin: '50% 50%',
          overwrite: true,
        }

        if (immediate || reduceMotion) {
          gsap.set(card, vars)
        } else {
          gsap.to(card, {
            ...vars,
            duration: 0.72,
            ease: 'power3.out',
          })
        }

        card.style.pointerEvents =
          distance < 0.48 ? 'auto' : 'none'

        card.setAttribute(
          'aria-hidden',
          distance > 1.55 ? 'true' : 'false',
        )
      })
    }

    const positionForIndex = (index) =>
      clamp(index, 0, cards.length - 1)

    const goToIndex = (targetIndex) => {
      const nextIndex = positionForIndex(
        targetIndex,
      )

      if (
        scrollTrigger &&
        desktop &&
        !reduceMotion
      ) {
        const progress =
          nextIndex /
          Math.max(cards.length - 1, 1)

        const targetScroll =
          scrollTrigger.start +
          (scrollTrigger.end -
            scrollTrigger.start) *
            progress

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        })

        return
      }

      setCardState(nextIndex)
    }

    const moveBy = (amount) => {
      goToIndex(currentIndex + amount)
    }

    if (!reduceMotion && desktop) {
      scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () =>
          `+=${Math.max(
            window.innerHeight *
              0.82 *
              (cards.length - 1),
            3000,
          )}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const position =
            self.progress *
            (cards.length - 1)

          setCardState(position, true)
        },
      })
    }

    const draggable = Draggable.create(proxy, {
      type: 'x',
      trigger: stage,
      allowEventDefault: true,
      onPress() {
        dragStartX = this.x
        stage.classList.add('is-dragging')
      },
      onRelease() {
        const delta = this.x - dragStartX

        stage.classList.remove('is-dragging')
        gsap.set(proxy, { x: 0 })

        if (Math.abs(delta) < 34) return

        moveBy(delta < 0 ? 1 : -1)
      },
    })[0]

    const handleHorizontalWheel = (event) => {
      const horizontalIntent =
        Math.abs(event.deltaX) >
        Math.abs(event.deltaY) * 0.8

      if (
        !horizontalIntent ||
        Math.abs(event.deltaX) < 22 ||
        archiveWheelLocked.current
      ) {
        return
      }

      event.preventDefault()
      archiveWheelLocked.current = true
      moveBy(event.deltaX > 0 ? 1 : -1)

      window.setTimeout(() => {
        archiveWheelLocked.current = false
      }, 520)
    }

    const handleKeys = (event) => {
      if (
        document.activeElement &&
        !stage.contains(document.activeElement) &&
        document.activeElement !== document.body
      ) {
        return
      }

      if (
        event.key === 'ArrowRight' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault()
        moveBy(1)
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault()
        moveBy(-1)
      }
    }

    stage.addEventListener(
      'wheel',
      handleHorizontalWheel,
      { passive: false },
    )

    window.addEventListener(
      'keydown',
      handleKeys,
    )

    archiveLoopApi.current = {
      goToIndex,
      moveBy,
      getIndex: () => currentIndex,
    }

    setCardState(0, true)

    return () => {
      stage.removeEventListener(
        'wheel',
        handleHorizontalWheel,
      )

      window.removeEventListener(
        'keydown',
        handleKeys,
      )

      draggable?.kill()
      scrollTrigger?.kill()
      gsap.killTweensOf(cards)
      archiveLoopApi.current = null
    }
  }, [])
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reduceMotion) return

      gsap.set('[data-reveal]', {
        y: 32,
        opacity: 0,
      })
      gsap.set('.expertise-card', {
        y: 38,
        opacity: 0,
      })

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
        })
        .from('.site-header', {
          y: -24,
          opacity: 0,
          duration: 0.8,
        })
        .to(
          '[data-reveal]',
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.09,
          },
          '-=0.35',
        )
        .to(
          '.expertise-card',
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
          },
          '-=0.55',
        )
    }, root)

    return () => context.revert()
  }, [])

  const handleCardPointer = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`)
    card.style.setProperty('--rotate-x', `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`)
    card.style.setProperty('--rotate-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`)
  }

  const resetCard = (event) => {
    const card = event.currentTarget
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  const active = carouselCards[activeCard]

  return (
    <div className="site" ref={root}>
      <div className="black-foundation" aria-hidden="true" />

      {/* ===== GLOBAL SITE NAVIGATION ===== */}

      <header
        className={`site-header global-site-header ${
          brandPageOpen || websitesPageOpen || froidPageOpen
            ? 'is-over-project-page'
            : ''
        }`}
      >
        <a
          className="monogram"
          href="#home"
          aria-label="John Wolf home"
          onClick={(event) => {
            event.preventDefault()
            navigateToSection('Home', true)
          }}
        >
          JW<span>.</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={
            menuOpen
              ? 'Close navigation'
              : 'Open navigation'
          }
          onClick={() =>
            setMenuOpen((open) => !open)
          }
        >
          <span />
          <span />
          <span />
          <span className="sr-only">
            Toggle navigation
          </span>
        </button>

        <nav
          className={`primary-navigation ${
            menuOpen ? 'is-open' : ''
          }`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <a
              className={
                activeNavigation === item
                  ? 'is-active'
                  : ''
              }
              href={navigationTargets[item]}
              key={item}
              aria-current={
                activeNavigation === item
                  ? 'page'
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                navigateToSection(item, true)
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="header-cta"
          type="button"
          onClick={() =>
            navigateToSection('Contact', true)
          }
        >
          Start a Project
          <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="experience" ref={experience}>
        <div className="experience-sticky full-page-section" id="home" ref={stickyStage}>
          <div className={`video-atmosphere ${videoReady ? 'is-ready' : ''}`} aria-hidden="true">
            <video
              ref={heroVideo}
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/hero-neon-poster.png"
              onCanPlay={() => setVideoReady(true)}
            >
              <source src="/assets/hero-neon.mp4" type="video/mp4" />
            </video>
            <div className="video-vignette" />
            <div className="video-grain" />
          </div>

          <div className="hero-interface">
            <div
              className="global-header-spacer"
              aria-hidden="true"
            />

            <div className="hero-layout">
              <div className="hero-copy">
                <p className="eyebrow" data-reveal>
                  Independent graphic designer
                </p>

                <h1 data-reveal>
                  John <span>Wolf</span>
                </h1>

                <p className="role" data-reveal>
                  Graphic Designer <span aria-hidden="true">+</span> Visual Storyteller
                </p>

                <p className="hero-statement" data-reveal>
                  I transform ideas into bold visual identities, immersive digital experiences,
                  and design systems built to leave a lasting impression.
                </p>

                <div className="hero-actions" data-reveal>
                  <button className="button button-primary" type="button" onClick={() => scrollToSection('#services')}>
                    Explore Selected Work
                    <span aria-hidden="true">→</span>
                  </button>
                  <button className="button button-secondary" type="button" onClick={() => scrollToSection('#about')}>
                    Let's Get Started
                  </button>
                </div>

                <div className="availability" data-reveal>
                  <span className="availability-dot" />
                  Available for select branding and web projects
                </div>
              </div>
            </div>

            <div className="expertise-grid">
              {expertise.map((item, index) => (
                <article
                  className="expertise-card"
                  key={item.title}
                  onPointerMove={handleCardPointer}
                  onPointerLeave={resetCard}
                >
                  <div className="icon-shell">
                    <ExpertiseIcon name={item.icon} />
                  </div>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <button className="scroll-cue" type="button" onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
              <span>Scroll to enter</span>
              <i aria-hidden="true" />
            </button>
          </div>

        </div>

        <section className="portfolio-page full-page-section" id="services">
          <div className="carousel-interface">
            <div className="carousel-heading">
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
            </div>

            <div className="carousel-active-copy" aria-live="polite">
              <span>{String(activeCard + 1).padStart(2, '0')} / {carouselCards.length}</span>
              <p>{active.eyebrow}</p>
              <h3>{active.title}</h3>
              <div className="active-rule" />
              <small>{active.description}</small>
            </div>

            <div
              className="carousel-viewport archive-seamless-stage"
              aria-label="Graphic design portfolio categories"
              ref={portfolioStage}
            >
              <div
                className="archive-drag-proxy"
                aria-hidden="true"
              />

              <div className="archive-seamless-track">
                {carouselCards.map((card, index) => (
                  <article
                    className={`carousel-card archive-seamless-card ${activeCard === index ? 'is-active' : ''} ${card.title === 'Brand Guidelines' || card.title === 'Logos' || card.title === 'Websites' ? 'is-brand-page-trigger' : ''}`}
                    key={card.title}
                    aria-label={card.title}
                    role="button"
                    tabIndex={
                      activeCard === index
                        ? 0
                        : -1
                    }
                    onClick={(event) => {
                      const current =
                        archiveLoopApi.current
                          ?.getIndex?.()

                      if (current !== index) {
                        archiveLoopApi.current
                          ?.goToIndex?.(index)
                        return
                      }

                      if (card.title === 'Logos') {
                        event.preventDefault()
                        openLogosPage(event)
                        return
                      }

                      if (
                        card.title ===
                        'Brand Guidelines'
                      ) {
                        openBrandGuidelines(event)
                        return
                      }

                      if (
                        card.title === 'Websites'
                      ) {
                        openWebsitesPage()
                      }
                    }}
                    onKeyDown={(event) => {
                      const activate =
                        event.key === 'Enter' ||
                        event.key === ' '

                      if (!activate) return
                      event.preventDefault()

                      const current =
                        archiveLoopApi.current
                          ?.getIndex?.()

                      if (current !== index) {
                        archiveLoopApi.current
                          ?.goToIndex?.(index)
                        return
                      }

                      if (card.title === 'Logos') {
                        openLogosPage(event)
                        return
                      }

                      if (
                        card.title ===
                        'Brand Guidelines'
                      ) {
                        openBrandGuidelines(event)
                        return
                      }

                      if (
                        card.title === 'Websites'
                      ) {
                        openWebsitesPage()
                      }
                    }}
                  >
                    <div className="carousel-card-video">
                      <video
                        muted
                        loop
                        playsInline
                        preload={
                          activeCard === index
                            ? 'auto'
                            : 'metadata'
                        }
                        poster={card.poster}
                        aria-hidden="true"

                      >
                        <source
                          src={card.video}
                          type="video/mp4"
                        />
                      </video>
                      <div className="carousel-card-shade" />
                    </div>

                    <div className="carousel-card-content">
                      <p>{card.eyebrow}</p>
                      <h3>{card.title}</h3>
                      <span>View collection ↗</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="services-scroll-cue" aria-hidden="true">
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
            </div>
          </div>
        </section>
      </section>

      <section
        className="chapter-page specialties-page full-page-section"
        id="about"
      >
        <video
          className="specialties-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/assets/about/specialties-background.mp4"
            type="video/mp4"
          />
        </video>

        <div
          className="specialties-background-shade"
          aria-hidden="true"
        />

        <div className="specialties-interface">
          <header className="specialties-heading">
            <p>SPECIALTIES</p>
            <h2>BEYOND DESIGN</h2>
            <span>
              20+ years of visual problem-solving across design,
              branding, illustration, web, and AI-assisted creative work.
            </span>
          </header>

          <div
            className="specialties-marquees"
            aria-label="Creative specialties and tools"
          >
            {[
              {
                direction: 'left',
                items: [
                  'Logo Design',
                  'Branding',
                  'Brand Guidelines',
                  'Graphic Design',
                  'Illustration',
                  'Creative Direction',
                  'Cover Art',
                  'Visual Identity',
                ],
              },
              {
                direction: 'right',
                items: [
                  'Photoshop',
                  'Illustrator',
                  'Adobe Firefly',
                  'Procreate',
                  'Canva',
                  'Figma',
                  'Vercel',
                  'GitHub',
                ],
              },
              {
                direction: 'left',
                items: [
                  'Web Design',
                  'Web Development',
                  'GSAP',
                  'Motion Design',
                  'ChatGPT',
                  'Lovable.AI',
                  'AI Imaging',
                  'AI Video',
                  'Concept Development',
                ],
              },
            ].map((row, rowIndex) => (
              <div
                className={`specialties-row specialties-row--${row.direction}`}
                key={`${row.direction}-${rowIndex}`}
              >
                <div className="specialties-track">
                  <div className="specialties-group">
                    {[...row.items, ...row.items].map((item, itemIndex) => (
                      <span
                        className="specialty-pill"
                        key={`${rowIndex}-${item}-${itemIndex}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div
                    className="specialties-group"
                    aria-hidden="true"
                  >
                    {[...row.items, ...row.items].map((item, itemIndex) => (
                      <span
                        className="specialty-pill"
                        key={`${rowIndex}-${item}-${itemIndex}-duplicate`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    {contactOpen && (
      <div
        className="contact-experience chapter-page"
        id="contact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-experience-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 11000,
          minHeight: '100svh',
        }}
      >
        <button
          className="header-cta"
          type="button"
          aria-label="Close Start a Project"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: 'var(--page-gutter)',
            zIndex: 2,
          }}
          onClick={() => {
            setContactOpen(false)
            setActiveNavigation(
              contactReturnNavigation.current,
            )
            window.requestAnimationFrame(() => {
              window.scrollTo({
                top: contactReturnY.current,
                behavior: 'auto',
              })
            })
          }}
        >
          Close <span aria-hidden="true">×</span>
        </button>

        <div className="chapter-page-copy">
          <p>Contact</p>
          <h2 id="contact-experience-title">
            Start something.
          </h2>
          <span>
            A full-screen closing chapter built around the next project.
          </span>
        </div>
      </div>
    )}
    

      {brandPageOpen && (
        <section
          className="brand-page-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Brand Guidelines"
        >
          <div
            className="brand-page-stage"
            ref={brandPageStage}
          >
            <video
              className="brand-page-origin-video"
              ref={brandPageOriginVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/carousel/brand-guidelines.jpg"
              aria-hidden="true"
            >
              <source
                src="/assets/carousel/brand-guidelines.mp4"
                type="video/mp4"
              />
            </video>

            <video
              className="brand-page-background-video"
              ref={brandPageBackgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/brand-guidelines/brand-guidelines-background-poster.jpg"
              aria-hidden="true"
            >
              <source
                src="/assets/brand-guidelines/brand-guidelines-background.mp4"
                type="video/mp4"
              />
            </video>

            <div className="brand-page-card-shade" />
            <div className="brand-page-faded-overlay" />

            <div className="brand-page-card-copy">
              <p>Visual systems</p>
              <h3>Brand Guidelines</h3>
              <span>View collection ↗</span>
            </div>

            <div className="brand-page-interface">
              <span className="brand-page-index brand-page-index-floating">
                {String(brandProjectIndex + 1).padStart(2, '0')}
                {' / '}
                {String(brandGuidelineProjects.length).padStart(2, '0')}
              </span>

              <div className="brand-page-copy">
                <p>Selected systems</p>

                <h2>
                  Brand
                  <br />
                  Guidelines
                </h2>

                <div
                  className="brand-page-active-project"
                  key={activeBrandProject.title}
                >
                  <span>{activeBrandProject.category}</span>
                  <h3>{activeBrandProject.title}</h3>

                  <i />

                  <p>{activeBrandProject.description}</p>

                  <button
                    type="button"
                    aria-label={`Open ${activeBrandProject.title} in the Brand Vault`}
                    onClick={() => {
                      setBrandVaultOpen(true)
                    }}
                  >
                    View Project
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>

              <div
                className="brand-project-carousel"
                aria-label="Brand Guidelines projects"
                onTouchStart={(event) => {
                  brandPageTouchStart.current =
                    event.touches[0]?.clientY ?? null
                }}
                onTouchEnd={(event) => {
                  const start = brandPageTouchStart.current
                  const end =
                    event.changedTouches[0]?.clientY

                  brandPageTouchStart.current = null

                  if (
                    start === null ||
                    end === undefined
                  ) {
                    return
                  }

                  const distance = start - end

                  if (Math.abs(distance) < 36) {
                    return
                  }

                  setBrandProjectIndex((current) => {
                    const total =
                      brandGuidelineProjects.length

                    const direction =
                      distance > 0 ? 1 : -1

                    return (
                      current +
                      direction +
                      total
                    ) % total
                  })
                }}
              >
                <div className="brand-project-perspective">
                  {brandGuidelineProjects.map(
                    (project, index) => {
                      const offset =
                        getBrandProjectOffset(
                          index,
                          brandProjectIndex,
                          brandGuidelineProjects.length,
                        )

                      const distance = Math.abs(offset)
                      const limitedDistance = Math.min(
                        distance,
                        4,
                      )
                      const visible = distance <= 4
                      const scale =
                        1 - limitedDistance * 0.08
                      const arcPush =
                        Math.pow(
                          limitedDistance,
                          1.45,
                        ) * 76
                      const verticalShift =
                        offset * 21
                      const tilt =
                        offset * 5.5
                      const depth =
                        limitedDistance * -95

                      return (
                        <button
                          className={`brand-project-card ${
                            offset === 0
                              ? 'is-active'
                              : ''
                          } ${
                            visible
                              ? ''
                              : 'is-hidden'
                          }`}
                          type="button"
                          key={project.title}
                          aria-label={
                            offset === 0
                              ? `Open ${project.title}`
                              : `Select ${project.title}`
                          }
                          aria-current={
                            offset === 0
                              ? 'true'
                              : undefined
                          }
                          tabIndex={
                            offset === 0 ? 0 : -1
                          }
                          onClick={() => {
                            if (offset === 0) {
                              setBrandVaultOpen(true)
                              return
                            }

                            setBrandProjectIndex(index)
                          }}
                          style={{
                            zIndex:
                              40 -
                              Math.round(
                                limitedDistance * 4,
                              ),
                            opacity: visible
                              ? 1 - limitedDistance * 0.16
                              : 0,
                            transform: `
                              translate3d(
                                ${arcPush}px,
                                calc(
                                  -50% +
                                  ${verticalShift}vh
                                ),
                                ${depth}px
                              )
                              rotateZ(${tilt}deg)
                              rotateY(${
                                -limitedDistance * 8
                              }deg)
                              scale(${scale})
                            `,
                          }}
                        >
                          <img
                            src={project.image}
                            alt=""
                          />

                          <span className="brand-project-card-shade" />

                          <span className="brand-project-card-copy">
                            <small>
                              {String(index + 1).padStart(2, '0')}
                            </small>

                            <strong>{project.title}</strong>
                          </span>
                        </button>
                      )
                    },
                  )}
                </div>

                <div className="brand-project-scroll-note">
                  <span>Scroll to explore</span>
                  <i />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <BrandVault
        open={
          brandPageOpen &&
          brandVaultOpen
        }
        project={activeBrandProject}
        projects={brandGuidelineProjects}
        activeIndex={brandProjectIndex}
        onClose={() => {
          setBrandVaultOpen(false)
        }}
        onSelectProject={(index) => {
          setBrandProjectIndex(index)
        }}
      />

      <WebsitesPage
        open={websitesPageOpen}
        onClose={closeWebsitesPage}
        onOpenProject={(slug) => {
          if (slug === 'froid') openFroidPage()
        }}
      />

      <FroidPage open={froidPageOpen} onClose={closeFroidPage} />
    </div>
  )
}
