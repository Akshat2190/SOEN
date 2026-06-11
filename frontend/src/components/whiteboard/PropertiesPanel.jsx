import React, { memo } from 'react';
import { useWhiteboardStore } from '../../store/whiteboardStore';
import styles from './PropertiesPanel.module.css';

const STROKE_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6',
  '#f59e0b', '#f97316', '#a855f7', '#ec4899', '#14b8a6',
];

const BG_COLORS = [
  'transparent', '#1e1e2e', '#ef4444', '#22c55e', '#3b82f6',
  '#f59e0b', '#f97316', '#a855f7', '#ec4899', '#14b8a6',
];

const FILL_STYLES = [
  { id: 'hachure', label: 'Hachure', icon: '▤' },
  { id: 'solid', label: 'Solid', icon: '■' },
  { id: 'cross-hatch', label: 'Cross', icon: '▦' },
  { id: 'none', label: 'None', icon: '□' },
];

const STROKE_WIDTHS = [
  { value: 1, label: 'Thin', widthPx: 20, heightPx: 1.5 },
  { value: 2, label: 'Medium', widthPx: 20, heightPx: 3 },
  { value: 4, label: 'Bold', widthPx: 20, heightPx: 5 },
];

const STROKE_STYLES = [
  { id: 'solid', label: '—' },
  { id: 'dashed', label: '- -' },
  { id: 'dotted', label: '···' },
];

const ROUGHNESS_LEVELS = [
  { value: 0, label: 'Architect' },
  { value: 1, label: 'Artist' },
  { value: 2, label: 'Cartoonist' },
];

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function ColorSwatch({ color, isSelected, onClick, isTransparent }) {
  return (
    <button
      onClick={onClick}
      title={color === 'transparent' ? 'Transparent' : color}
      className={`${styles.colorSwatch} ${isSelected ? styles.selected : ''} ${isTransparent ? styles.transparentSwatch : ''}`}
      style={!isTransparent ? { backgroundColor: color } : undefined}
    />
  );
}

function OptionButton({ isActive, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${styles.optionButton} ${isActive ? styles.activeOption : ''}`}
    >
      {children}
    </button>
  );
}

const PropertiesPanel = memo(function PropertiesPanel({ visible }) {
  const {
    selectedIds, elements,
    strokeColor, setStrokeColor,
    backgroundColor, setBackgroundColor,
    fillStyle, setFillStyle,
    strokeWidth, setStrokeWidth,
    strokeStyle, setStrokeStyle,
    roughness, setRoughness,
    opacity, setOpacity,
    updateElement, tool,
  } = useWhiteboardStore();

  if (!visible) return null;

  // Determine if panel should show fill options
  const selectedEls = elements.filter((el) => selectedIds.includes(el.id));
  const hasFillable = selectedEls.some((el) => ['rectangle', 'ellipse', 'diamond'].includes(el.type));
  const showFill = hasFillable || ['rectangle', 'ellipse', 'diamond'].includes(tool);

  // Update selected elements when style changes
  const updateSelected = (changes) => {
    selectedIds.forEach((id) => updateElement(id, changes));
  };

  return (
    <div className={styles.propertiesPanel}>
      {/* Stroke Color */}
      <Section title="Stroke">
        <div className={styles.swatchesRow}>
          {STROKE_COLORS.map((c) => (
            <ColorSwatch
              key={c}
              color={c}
              isSelected={strokeColor === c}
              onClick={() => { setStrokeColor(c); updateSelected({ strokeColor: c }); }}
            />
          ))}
        </div>
        <input
          type="color"
          className={styles.colorPicker}
          value={strokeColor === 'transparent' ? '#ffffff' : strokeColor}
          onChange={(e) => { setStrokeColor(e.target.value); updateSelected({ strokeColor: e.target.value }); }}
        />
      </Section>

      {/* Background Color */}
      <Section title="Background">
        <div className={styles.swatchesRow}>
          {BG_COLORS.map((c) => (
            <ColorSwatch
              key={c}
              color={c}
              isSelected={backgroundColor === c}
              isTransparent={c === 'transparent'}
              onClick={() => { setBackgroundColor(c); updateSelected({ backgroundColor: c }); }}
            />
          ))}
        </div>
      </Section>

      {/* Fill Style */}
      {showFill && (
        <Section title="Fill">
          <div className={styles.optionsGrid}>
            {FILL_STYLES.map((f) => (
              <OptionButton
                key={f.id}
                isActive={fillStyle === f.id}
                onClick={() => { setFillStyle(f.id); updateSelected({ fillStyle: f.id }); }}
                title={f.label}
              >
                <span>{f.icon}</span>
              </OptionButton>
            ))}
          </div>
        </Section>
      )}

      {/* Stroke Width */}
      <Section title="Stroke Width">
        <div className={styles.optionsGrid}>
          {STROKE_WIDTHS.map((w) => (
            <OptionButton
              key={w.value}
              isActive={strokeWidth === w.value}
              onClick={() => { setStrokeWidth(w.value); updateSelected({ strokeWidth: w.value }); }}
              title={w.label}
            >
              <div
                className={styles.strokeWidthIndicator}
                style={{ width: w.widthPx, height: w.heightPx }}
              />
            </OptionButton>
          ))}
        </div>
      </Section>

      {/* Stroke Style */}
      <Section title="Stroke Style">
        <div className={styles.optionsGrid}>
          {STROKE_STYLES.map((s) => (
            <OptionButton
              key={s.id}
              isActive={strokeStyle === s.id}
              onClick={() => { setStrokeStyle(s.id); updateSelected({ strokeStyle: s.id }); }}
              title={s.id}
            >
              <span style={{ fontSize: '11px', letterSpacing: s.id === 'dotted' ? '2px' : '0' }}>
                {s.label}
              </span>
            </OptionButton>
          ))}
        </div>
      </Section>

      {/* Roughness */}
      <Section title="Roughness">
        <div className={styles.optionsGrid}>
          {ROUGHNESS_LEVELS.map((r) => (
            <OptionButton
              key={r.value}
              isActive={roughness === r.value}
              onClick={() => { setRoughness(r.value); updateSelected({ roughness: r.value }); }}
              title={r.label}
            >
              <span style={{ fontSize: '9px' }}>{r.label.slice(0, 4)}</span>
            </OptionButton>
          ))}
        </div>
      </Section>

      {/* Opacity */}
      <Section title={`Opacity — ${opacity}%`}>
        <input
          type="range"
          min={10}
          max={100}
          value={opacity}
          onChange={(e) => {
            const v = Number(e.target.value);
            setOpacity(v);
            updateSelected({ opacity: v });
          }}
          className={styles.slider}
        />
      </Section>
    </div>
  );
});

export default PropertiesPanel;
