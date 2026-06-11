import React, { memo } from 'react';
import { useWhiteboardStore } from '../../store/whiteboardStore';
import styles from './ZoomControls.module.css';

const ZoomControls = memo(function ZoomControls() {
  const { zoom, setZoom, setScroll } = useWhiteboardStore();
  const pct = Math.round(zoom * 100);

  return (
    <div className={styles.zoomContainer}>
      <button
        className={styles.zoomBtn}
        onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
        title="Zoom out (Ctrl+-)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button
        className={styles.zoomText}
        onClick={() => { setZoom(1); setScroll(0, 0); }}
        title="Reset zoom (Ctrl+0)"
      >
        {pct}%
      </button>

      <button
        className={styles.zoomBtn}
        onClick={() => setZoom(Math.min(5, zoom + 0.1))}
        title="Zoom in (Ctrl+=)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
});

export default ZoomControls;
