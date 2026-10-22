export function ProgressRing({ ratio, size = 44, stroke = 4 }: { ratio: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(ratio * 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% done`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elev-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ratio >= 1 ? 'var(--done)' : 'var(--active)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
      <text x="50%" y="50%" dy="0.35em" textAnchor="middle" fontSize={size * 0.26} fontWeight={600} fill="var(--text)">
        {pct}%
      </text>
    </svg>
  );
}
