import React, { useEffect, useState } from 'react'
import LandingNav from '../components/landing/LandingNav'
import LandingHero from '../components/landing/LandingHero'
import LandingFeatures from '../components/landing/LandingFeatures'
import LandingHowItWorks from '../components/landing/LandingHowItWorks'
import LandingTechStack from '../components/landing/LandingTechStack'
import LandingCTA from '../components/landing/LandingCTA'
import LandingAbout from '../components/landing/LandingAbout'
import LandingFooter from '../components/landing/LandingFooter'
import ThemeToggle from '../components/landing/ThemeToggle'

const Landing = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('flux-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('flux-theme', theme)
  }, [theme])

  return (
    <div data-theme={theme} className="flux-root">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTechStack />
        <LandingCTA />
        <LandingAbout />
      </main>
      <LandingFooter />
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </div>
  )
}

export default Landing
