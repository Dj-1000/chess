import { useEffect, useState } from 'react'
import { APP_NAME } from './config'
import type { ThemeId } from './themes'
import type { Level } from './levels'
import Home from './Home'
import Setup from './Setup'
import Game from './Game'
import Avatar from './Avatar'
import ChooseCharacter from './ChooseCharacter'
import { characterById, getSavedPlayerId, savePlayerId } from './players'
import ChooseCharacter from './ChooseCharacter'
import { characterById, getSavedPlayerId, savePlayerId } from './players'

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
  // Your character. It is null on a first visit, until you choose one.
  const [playerId, setPlayerId] = useState<string | null>(getSavedPlayerId)
  const [choosing, setChoosing] = useState(false)
  // Your character. It is null on a first visit, until you choose one.
  const [playerId, setPlayerId] = useState<string | null>(getSavedPlayerId)
  const [choosing, setChoosing] = useState(false)

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
  const me = playerId ? characterById(playerId) : null
  // Changing character is only possible between games
  const canChange = screen === 'home' || screen === 'setup'
  const me = playerId ? characterById(playerId) : null
  // Changing character is only possible between games
  const canChange = screen === 'home' || screen === 'setup'

  return (
    <main className="app">
      <header className="topbar">
        <img
          className="logo"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
        />
        <span>{APP_NAME}</span>
        {me &&
          (canChange ? (
            <button
              className="me"
              title="Change your character"
              onClick={() => setChoosing(true)}
            >
              <Avatar character={me} />
              <span>{me.name}</span>
              <small>Change</small>
            </button>
          ) : (
            <div className="me">
              <Avatar character={me} />
              <span>{me.name}</span>
            </div>
          ))}
        {me &&
          (canChange ? (
            <button
              className="me"
              title="Change your character"
              onClick={() => setChoosing(true)}
            >
              <Avatar character={me} />
              <span>{me.name}</span>
              <small>Change</small>
            </button>
          ) : (
            <div className="me">
              <Avatar character={me} />
              <span>{me.name}</span>
            </div>
          ))}
      </header>

      {!playerId || choosing ? (
        <ChooseCharacter
          current={playerId}
          onCancel={playerId ? () => setChoosing(false) : undefined}
          onConfirm={(id) => {
            savePlayerId(id)
            setPlayerId(id)
            setChoosing(false)
          }}
        />
      ) : (
        <>
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
              playerId={playerId}
              themeId={themeId}
              onThemeChange={setThemeId}
              onExit={goHome}
              a onNewGame={goHome}
            />
          )}

          {screen === 'computer' && config && (
            <Game
              key={gameKey}
              mode="computer"
              level={config.level}
              playerColor={config.color}
              playerId={playerId}
              themeId={themeId}
              onThemeChange={setThemeId}
              onExit={goHome}
              onNewGame={() => setScreen('setup')}
            />
          )}
        </>
      )}

      <footer className="credit">
        Pieces by Toan Hoang (MIT license) · Engine: Stockfish (GPL-3.0)
      </footer>
    </main>
  )
}