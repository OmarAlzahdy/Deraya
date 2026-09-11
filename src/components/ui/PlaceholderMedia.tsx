/**
 * No photography exists yet (handoff: *Assets*). Every image slot in the
 * product renders this striped block with a monospace caption until real
 * photographs arrive — and it says so, in the interface, rather than shipping
 * a stock image. Photographs replacing these are shot on dark or black
 * backgrounds and go through the .lighten wrapper.
 */
export function PlaceholderMedia({
  caption,
  ratio = '3 / 2',
  className,
}: {
  caption: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure
      className={['placeholder-media', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: ratio }}
    >
      <figcaption dir="ltr" className="ltr">
        {caption}
      </figcaption>
    </figure>
  );
}
