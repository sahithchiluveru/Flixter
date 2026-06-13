// The toolbar icon toggles the injected rail. There is no popup; clicking the
// action sends a message to the content script on the active tab, which flips
// the rail open/closed. Tabs without our content script (non-watch pages) have
// no listener, so the send rejects harmlessly.
chrome.action.onClicked.addListener((tab) => {
  if (tab.id == null) return
  chrome.tabs
    .sendMessage(tab.id, { type: 'FLIXTER_TOGGLE_RAIL' })
    .catch(() => {
      /* no content script on this page — ignore */
    })
})
