/**
 * No photography exists yet (handoff: *Assets*). Every image slot in the
 * product renders this striped block with a monospace caption until real
 * photographs arrive — and it says so, in the interface, rather than shipping
 * a stock image.
 *
 * Photographs replacing these go through the .blend-photo wrapper. Note the
 * brief's instruction to shoot on dark backgrounds was written for the dark
 * palette; on Paper the blend is multiply, so the shoot wants white or very
 * light backdrops instead.
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
