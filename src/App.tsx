import { useEffect, useState } from 'react'
import { APP_NAME } from './config'
import type { ThemeId } from './themes'
import type { Level } from './levels'
import Home from './Home'
import Setup from './Setup'
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

type Screen = 'home' | 'setup' | 'pass' | 'computer'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [themeId, setThemeId] = useState<ThemeId>(loadTheme)
  const [config, setConfig] = useState<{ level: Level; color: 'w' | 'b' } | null>(
    null,
  )
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = themeId
    try {
      localStorage.setItem('theme', themeId)
    } catch {
      // ignore
    }
  }, [themeId])

  const goHome = () => setScreen('home')

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

      {screen === 'home' && (
        <Home
          onPlay={(mode) => {
            if (mode === 'pass') {
              setGameKey((k) => k + 1)
              setScreen('pass')
            } else {
              setScreen('setup')
            }
          }}
        />
      )}

      {screen === 'setup' && (
        <Setup
          onBack={goHome}
          onStart={(level, color) => {
            setConfig({ level, color })
            setGameKey((k) => k + 1)
            setScreen('computer')
          }}
        />
      )}

      {screen === 'pass' && (
        <Game
          key={gameKey}
          mode="pass"
          themeId={themeId}
          onThemeChange={setThemeId}
          onExit={goHome}
        />
      )}

      {screen === 'computer' && config && (
        <Game
          key={gameKey}
          mode="computer"
          level={config.level}
          playerColor={config.color}
          themeId={themeId}
          onThemeChange={setThemeId}
          onExit={goHome}
        />
      )}

      <footer className="credit">
        Pieces by Toan Hoang (MIT license) · Engine: Stockfish (GPL-3.0)
      </footer>
    </main>
  )
}