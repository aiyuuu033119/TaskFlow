'use client'

import { Keyboard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface KeyboardShortcut {
  keys: string[]
  description: string
  category?: string
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts: KeyboardShortcut[] = [
  // Global shortcuts
  { keys: ['Ctrl', 'K'], description: 'Quick add task', category: 'Global' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Global' },
  { keys: ['Ctrl', '/'], description: 'Focus search', category: 'Global' },
  { keys: ['T'], description: 'Toggle theme', category: 'Global' },

  // Navigation
  { keys: ['↑', '↓'], description: 'Navigate tasks', category: 'Navigation' },
  { keys: ['J', 'K'], description: 'Navigate tasks (Vim style)', category: 'Navigation' },
  { keys: ['Home'], description: 'Go to first task', category: 'Navigation' },
  { keys: ['End'], description: 'Go to last task', category: 'Navigation' },
  { keys: ['Tab'], description: 'Focus next element', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Focus previous element', category: 'Navigation' },

  // Task actions
  { keys: ['Enter'], description: 'Open/Edit selected task', category: 'Task Actions' },
  { keys: ['Space'], description: 'Toggle task completion', category: 'Task Actions' },
  { keys: ['Delete'], description: 'Delete selected task', category: 'Task Actions' },
  { keys: ['D', 'D'], description: 'Delete selected task (Vim style)', category: 'Task Actions' },
  { keys: ['E'], description: 'Edit selected task', category: 'Task Actions' },
  { keys: ['N'], description: 'Create new task', category: 'Task Actions' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate task', category: 'Task Actions' },

  // Filters
  { keys: ['1'], description: 'Show all tasks', category: 'Filters' },
  { keys: ['2'], description: 'Show active tasks', category: 'Filters' },
  { keys: ['3'], description: 'Show completed tasks', category: 'Filters' },
  { keys: ['Ctrl', '1'], description: 'Filter by high priority', category: 'Filters' },
  { keys: ['Ctrl', '2'], description: 'Filter by medium priority', category: 'Filters' },
  { keys: ['Ctrl', '3'], description: 'Filter by low priority', category: 'Filters' },

  // Dialog/Modal
  { keys: ['Escape'], description: 'Close dialog/Cancel', category: 'Dialog' },
  { keys: ['Ctrl', 'Enter'], description: 'Save and close', category: 'Dialog' },
]

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and manage tasks more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
              ?
            </kbd>{' '}
            at any time to show this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
