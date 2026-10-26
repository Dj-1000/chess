import { useEffect, useState } from 'react'
import { APP_NAME } from './config'
import type { ThemeId } from './themes'
import Home from './Home'
import Game from './Game'

function loadTheme(): ThemeId {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'classic' || saved === 'walnut') return saved
  } catch {
    // storage unavailable: use the default
  }
  return 'classic'
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'pass'>('home')
  const [themeId, setThemeId] = useState<ThemeId>(loadTheme)

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  // Apply the theme to the whole page and remember it for next visit
  useEffect(() => {
    document.documentElement.dataset.theme = themeId
    try {
      localStorage.setItem('theme', themeId)
    } catch {
      // ignore
    }
  }, [themeId])

  return (
    <main className="app">
      <header className="topbar">
        <img
          className="logo"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
        />
        <span>{APP_NAME}</span>
      </header>

      {screen === 'home' ? (
        <Home onPlay={(mode) => setScreen(mode)} />
      ) : (
        <Game
          themeId={themeId}
          onThemeChange={setThemeId}
          onExit={() => setScreen('home')}
        />
      )}

      <footer className="credit">Pieces by Toan Hoang (MIT license)</footer>
    </main>
  )
}