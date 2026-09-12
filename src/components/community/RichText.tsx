import { CodeBlock } from '@/components/ui/Bidi';

/**
 * Thread bodies, rendered.
 *
 * The one rule that matters here is the brief's: code blocks render LTR inside
 * Arabic threads. A fenced block becomes a direction island; everything else
 * runs in the page's direction. Inline `code` spans stay LTR too, isolated so
 * a repo path in the middle of an Arabic sentence does not reorder the words
 * around it.
 *
 * Deliberately not a Markdown engine: this renders what community answers
 * actually contain — paragraphs and code. Nothing here interprets HTML, so a
 * pasted <script> stays characters on a page.
 */
export function RichText({ body }: { body: string }) {
  const segments = body.split(/```/);

  return (
    <div className="stack stack-3">
      {segments.map((segment, index) => {
        // Odd segments are between fences.
        if (index % 2 === 1) {
          const withoutLanguage = segment.replace(/^[a-zA-Z0-9+-]*\n/, '');
          return <CodeBlock key={index}>{withoutLanguage.replace(/\n$/, '')}</CodeBlock>;
        }

        return segment
          .split(/\n{2,}/)
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph, paragraphIndex) => (
            <p key={`${index}-${paragraphIndex}`} className="measure">
              {renderInline(paragraph)}
            </p>
          ));
      })}
    </div>
  );
}

function renderInline(text: string) {
  return text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code key={index} dir="ltr" className="ltr">
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
