import { useEffect, useRef, useCallback } from 'react'

type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  handler: () => void
}

interface UseKeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[]
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onSelect?: () => void
  onCancel?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation({
  shortcuts = [],
  onNavigate,
  onSelect,
  onCancel,
  enabled = true
}: UseKeyboardNavigationOptions = {}) {
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts)

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const { key, ctrlKey, altKey, shiftKey, metaKey } = event

    // Check for matching shortcuts
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = (shortcut.ctrl || false) === ctrlKey
      const altMatch = (shortcut.alt || false) === altKey
      const shiftMatch = (shortcut.shift || false) === shiftKey
      const metaMatch = (shortcut.meta || false) === metaKey

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.handler()
      return
    }

    // Handle navigation keys
    switch (key) {
      case 'ArrowUp':
        if (onNavigate) {
          event.preventDefault()
          onNavigate('up')
        }
        break
      case 'ArrowDown':
        if (onNavigate) {
          event.preventDefault()
          onNavigate('down')
        }
        break
      case 'ArrowLeft':
        if (onNavigate) {
          event.preventDefault()
          onNavigate('left')
        }
        break
      case 'ArrowRight':
        if (onNavigate) {
          event.preventDefault()
          onNavigate('right')
        }
        break
      case 'Enter':
        if (onSelect && !event.target || 
            (event.target instanceof HTMLElement && 
             !['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName))) {
          event.preventDefault()
          onSelect()
        }
        break
      case 'Escape':
        if (onCancel) {
          event.preventDefault()
          onCancel()
        }
        break
    }
  }, [enabled, onNavigate, onSelect, onCancel])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])

  return {
    shortcuts: shortcutsRef.current
  }
}

// Global keyboard shortcuts registry
const globalShortcuts = new Map<string, KeyboardShortcut>()

export function registerGlobalShortcut(shortcut: KeyboardShortcut) {
  const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.meta ? 'meta+' : ''}${shortcut.key.toLowerCase()}`
  globalShortcuts.set(key, shortcut)
}

export function unregisterGlobalShortcut(shortcut: KeyboardShortcut) {
  const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.meta ? 'meta+' : ''}${shortcut.key.toLowerCase()}`
  globalShortcuts.delete(key)
}

export function getAllShortcuts(): KeyboardShortcut[] {
  return Array.from(globalShortcuts.values())
}