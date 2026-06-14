import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RailApp } from './RailApp'
import railCss from './rail.css?inline'

const HOST_ID = 'flixter-rail-host'

// Mount the rail inside a Shadow DOM so Netflix's styles and ours can't bleed
// into each other. The compiled Tailwind CSS is injected into the shadow root.
function mount() {
  if (document.getElementById(HOST_ID)) return

  const host = document.createElement('div')
  host.id = HOST_ID
  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = railCss
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(
    <StrictMode>
      <RailApp />
    </StrictMode>,
  )
}

mount()

// Relay the toolbar-icon toggle from the background service worker into a DOM
// event the React app listens for.
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'FLIXTER_TOGGLE_RAIL') {
    window.dispatchEvent(new CustomEvent('flixter:toggle'))
  }
})
