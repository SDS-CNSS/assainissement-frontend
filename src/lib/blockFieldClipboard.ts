import type {
  ClipboardEvent,
  DragEvent,
  InputEvent as ReactInputEvent,
  InputHTMLAttributes,
  MouseEvent,
} from 'react'

/** Force la saisie manuelle (RG-07 double saisie email / champs sensibles). */
export function blockFieldClipboard(
  event: ClipboardEvent<HTMLInputElement>,
): void {
  event.preventDefault()
}

export function blockFieldDrop(event: DragEvent<HTMLInputElement>): void {
  event.preventDefault()
}

export function blockFieldContextMenu(
  event: MouseEvent<HTMLInputElement>,
): void {
  event.preventDefault()
}

/**
 * Bloque aussi l'insertion via beforeinput (certains navigateurs / gestionnaires
 * de mots de passe contournent partiellement onPaste seul).
 */
export function blockFieldBeforeInput(
  event: ReactInputEvent<HTMLInputElement>,
): void {
  const inputType = event.nativeEvent.inputType
  if (
    inputType === 'insertFromPaste' ||
    inputType === 'insertFromDrop' ||
    inputType === 'insertFromYank'
  ) {
    event.preventDefault()
  }
}

/**
 * Props à étaler sur un Input pour refuser copier / coller / glisser-déposer.
 * Phase capture + bubble : plus fiable si un parent ou register ajoute des handlers.
 * À placer APRÈS `{...register(...)}` pour que ces handlers ne soient pas écrasés.
 */
export const noClipboardInputProps = {
  autoComplete: 'off',
  onPaste: blockFieldClipboard,
  onPasteCapture: blockFieldClipboard,
  onCopy: blockFieldClipboard,
  onCopyCapture: blockFieldClipboard,
  onCut: blockFieldClipboard,
  onCutCapture: blockFieldClipboard,
  onDrop: blockFieldDrop,
  onDropCapture: blockFieldDrop,
  onDragOver: blockFieldDrop,
  onDragOverCapture: blockFieldDrop,
  onContextMenu: blockFieldContextMenu,
  onBeforeInput: blockFieldBeforeInput,
} as const satisfies InputHTMLAttributes<HTMLInputElement>
