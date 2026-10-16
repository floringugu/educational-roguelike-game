import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { es } from '../i18n/es';
import './CombatMenu.css';

type CombatMenuProps = {
  onOpenSettings: () => void;
  onOpenCredits: () => void;
};

// The menu at the top left of the combat (ticket 12): a small post-it with
// three lines drawn on it (ADR-0016). It opens a list with Ajustes and
// Créditos, on a sheet of a notebook.
//
// It is a disclosure button: a button that shows and hides the list under
// it. aria-expanded tells screen readers whether the list is open, and the
// entries are plain buttons, reached with Tab like any other.
export function CombatMenu({ onOpenSettings, onOpenCredits }: CombatMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const menuElement = useRef<HTMLDivElement>(null);
  const buttonElement = useRef<HTMLButtonElement>(null);

  function closeAndFocusButton() {
    setIsOpen(false);
    buttonElement.current?.focus();
  }

  // On open, the focus goes to the first entry, so the keyboard and the
  // screen reader land on the list.
  useEffect(() => {
    if (isOpen) {
      menuElement.current?.querySelector<HTMLElement>('.combat-menu__entry')?.focus();
    }
  }, [isOpen]);

  // A touch or a click anywhere outside the menu closes it.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !menuElement.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeAndFocusButton();
    }
  }

  return (
    <div ref={menuElement} className="combat-menu" onKeyDown={handleKeyDown}>
      <button
        ref={buttonElement}
        type="button"
        className="combat-menu__button"
        aria-label={es.combat.menuButton}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen(!isOpen)}
      />
      {/* The list is always in the page and `hidden` while closed, so
          aria-controls always points to it. */}
      <ul id={listId} className="combat-menu__list" hidden={!isOpen}>
        <li>
          <button type="button" className="combat-menu__entry" onClick={onOpenSettings}>
            {es.combat.settingsButton}
          </button>
        </li>
        <li>
          <button type="button" className="combat-menu__entry" onClick={onOpenCredits}>
            {es.combat.creditsButton}
          </button>
        </li>
      </ul>
    </div>
  );
}
