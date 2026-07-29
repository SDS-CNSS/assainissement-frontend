import { describe, expect, it, vi } from 'vitest'
import {
  blockFieldBeforeInput,
  blockFieldClipboard,
  blockFieldContextMenu,
  blockFieldDrop,
  noClipboardInputProps,
} from '@/lib/blockFieldClipboard'

describe('blockFieldClipboard helpers — RG-07 saisie manuelle', () => {
  it('expose les handlers clipboard / drop / contextmenu / beforeinput', () => {
    expect(noClipboardInputProps.onPaste).toBe(blockFieldClipboard)
    expect(noClipboardInputProps.onPasteCapture).toBe(blockFieldClipboard)
    expect(noClipboardInputProps.onCopy).toBe(blockFieldClipboard)
    expect(noClipboardInputProps.onCut).toBe(blockFieldClipboard)
    expect(noClipboardInputProps.onDrop).toBe(blockFieldDrop)
    expect(noClipboardInputProps.onContextMenu).toBe(blockFieldContextMenu)
    expect(noClipboardInputProps.onBeforeInput).toBe(blockFieldBeforeInput)
    expect(noClipboardInputProps.autoComplete).toBe('off')
  })

  it('blockFieldClipboard appelle preventDefault', () => {
    const preventDefault = vi.fn()
    blockFieldClipboard({ preventDefault } as never)
    expect(preventDefault).toHaveBeenCalledOnce()
  })

  it('blockFieldDrop et blockFieldContextMenu appellent preventDefault', () => {
    const preventDefault = vi.fn()
    blockFieldDrop({ preventDefault } as never)
    blockFieldContextMenu({ preventDefault } as never)
    expect(preventDefault).toHaveBeenCalledTimes(2)
  })

  it('blockFieldBeforeInput bloque insertFromPaste / insertFromDrop', () => {
    for (const inputType of ['insertFromPaste', 'insertFromDrop', 'insertFromYank']) {
      const preventDefault = vi.fn()
      blockFieldBeforeInput({
        preventDefault,
        nativeEvent: { inputType },
      } as never)
      expect(preventDefault).toHaveBeenCalledOnce()
    }
  })

  it('blockFieldBeforeInput laisse passer la saisie clavier', () => {
    const preventDefault = vi.fn()
    blockFieldBeforeInput({
      preventDefault,
      nativeEvent: { inputType: 'insertText' },
    } as never)
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
