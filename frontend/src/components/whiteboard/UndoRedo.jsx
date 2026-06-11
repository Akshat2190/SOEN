import React, { memo } from 'react';
import styles from './UndoRedo.module.css';

const UndoRedo = memo(function UndoRedo({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div className={styles.undoRedoContainer}>
      <button
        className={`${styles.actionBtn} ${!canUndo ? styles.disabled : ''}`}
        onClick={canUndo ? onUndo : undefined}
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>

      <button
        className={`${styles.actionBtn} ${!canRedo ? styles.disabled : ''}`}
        onClick={canRedo ? onRedo : undefined}
        title="Redo (Ctrl+Shift+Z)"
        disabled={!canRedo}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
      </button>
    </div>
  );
});

export default UndoRedo;
