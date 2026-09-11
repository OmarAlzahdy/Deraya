import { Ltr } from '@/components/ui/Bidi';

const RAMP_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/** A tonal ramp, rendered from the tokens rather than from a hard-coded list. */
export function Ramp({ name, role }: { name: string; role: 'accent' | 'neutral' }) {
  return (
    <div className="stack stack-2">
      <span className="t-fine text-muted">{name}</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${RAMP_STEPS.length}, minmax(0, 1fr))`,
          gap: '2px',
        }}
      >
        {RAMP_STEPS.map((step) => (
          <div key={step} className="stack stack-1">
            <div
              style={{
                background: `var(--color-${role}-${step})`,
                blockSize: 44,
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <Ltr className="t-fine text-muted" style={{ fontSize: 10 }}>
              {step}
            </Ltr>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A role swatch with its token name and value, both LTR in either language. */
export function RoleSwatch({
  token,
  value,
  note,
}: {
  token: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'nowrap' }}>
      <div
        style={{
          background: `var(${token})`,
          inlineSize: 40,
          blockSize: 40,
          flex: 'none',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
      <div className="stack stack-1">
        <Ltr className="t-mono t-fine">{token}</Ltr>
        <Ltr className="t-mono t-fine text-muted">{value}</Ltr>
        {note ? <span className="t-fine text-muted">{note}</span> : null}
      </div>
    </div>
  );
}
