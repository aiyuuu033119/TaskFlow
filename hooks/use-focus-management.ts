import { useEffect, useRef, useState, useCallback } from 'react'

interface UseFocusManagementOptions {
  items: any[]
  onItemSelect?: (item: any, index: number) => void
  onItemFocus?: (item: any, index: number) => void
  initialIndex?: number
  wrap?: boolean
  orientation?: 'vertical' | 'horizontal' | 'grid'
  gridColumns?: number
}

export function useFocusManagement({
  items,
  onItemSelect,
  onItemFocus,
  initialIndex = 0,
  wrap = true,
  orientation = 'vertical',
  gridColumns = 1
}: UseFocusManagementOptions) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  // Update focused index when items change
  useEffect(() => {
    if (focusedIndex >= items.length && items.length > 0) {
      setFocusedIndex(items.length - 1)
    }
  }, [items.length, focusedIndex])

  // Focus the element when index changes
  useEffect(() => {
    const element = itemRefs.current[focusedIndex]
    if (element) {
      element.focus()
      onItemFocus?.(items[focusedIndex], focusedIndex)
    }
  }, [focusedIndex, items, onItemFocus])

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (items.length === 0) return

    let newIndex = focusedIndex

    switch (orientation) {
      case 'vertical':
        if (direction === 'up') {
          newIndex = focusedIndex - 1
        } else if (direction === 'down') {
          newIndex = focusedIndex + 1
        }
        break

      case 'horizontal':
        if (direction === 'left') {
          newIndex = focusedIndex - 1
        } else if (direction === 'right') {
          newIndex = focusedIndex + 1
        }
        break

      case 'grid':
        const row = Math.floor(focusedIndex / gridColumns)
        const col = focusedIndex % gridColumns
        
        if (direction === 'up' && row > 0) {
          newIndex = (row - 1) * gridColumns + col
        } else if (direction === 'down') {
          newIndex = (row + 1) * gridColumns + col
        } else if (direction === 'left' && col > 0) {
          newIndex = row * gridColumns + (col - 1)
        } else if (direction === 'right' && col < gridColumns - 1) {
          newIndex = row * gridColumns + (col + 1)
        }
        break
    }

    // Handle wrapping
    if (wrap) {
      if (newIndex < 0) {
        newIndex = items.length - 1
      } else if (newIndex >= items.length) {
        newIndex = 0
      }
    } else {
      newIndex = Math.max(0, Math.min(items.length - 1, newIndex))
    }

    if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < items.length) {
      setFocusedIndex(newIndex)
    }
  }, [focusedIndex, items.length, wrap, orientation, gridColumns])

  const selectFocused = useCallback(() => {
    if (items[focusedIndex]) {
      onItemSelect?.(items[focusedIndex], focusedIndex)
    }
  }, [focusedIndex, items, onItemSelect])

  const setItemRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el
  }, [])

  const focusFirst = useCallback(() => {
    setFocusedIndex(0)
  }, [])

  const focusLast = useCallback(() => {
    setFocusedIndex(items.length - 1)
  }, [items.length])

  const focusNext = useCallback(() => {
    navigate(orientation === 'horizontal' ? 'right' : 'down')
  }, [navigate, orientation])

  const focusPrevious = useCallback(() => {
    navigate(orientation === 'horizontal' ? 'left' : 'up')
  }, [navigate, orientation])

  return {
    focusedIndex,
    setFocusedIndex,
    navigate,
    selectFocused,
    setItemRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    isFocused: (index: number) => index === focusedIndex
  }
}