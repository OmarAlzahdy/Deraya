import type { Localized, MaybePlaceholder } from './types';

/**
 * The proof artifact on the home page.
 *
 * The brief is specific: one *real* review comment or repository, not a
 * testimonial. No real one has been cleared for publication yet, so what ships
 * is the structure — a diff with a line-anchored comment from a named engineer
 * — with the content marked pending. Swapping in a real review is replacing
 * this object, not rebuilding the component.
 *
 * The diff below is deliberately generic scaffolding, not a claim about
 * anyone's code.
 */
export type ProofComment = {
  author: Localized;
  body: Localized;
  /** Line in the hunk the comment anchors to, 1-indexed within `lines`. */
  anchorLine: number;
};

export type ProofArtifact = MaybePlaceholder<{
  repo: string;
  branch: string;
  filePath: string;
  /** Unified-diff lines. `sign` drives the gutter and the tint. */
  lines: { sign: ' ' | '+' | '-'; text: string; lineNumber: number }[];
  comment: ProofComment;
}>;

export const proof: ProofArtifact = {
  repo: 'deraya/example-service',
  branch: 'feat/retrieval-eval',
  filePath: 'src/retrieval/index.ts',
  lines: [
    { sign: ' ', text: 'export async function retrieve(query: string) {', lineNumber: 41 },
    { sign: '-', text: '  const hits = await index.search(query, { k: 5 });', lineNumber: 42 },
    { sign: '+', text: '  const hits = await index.search(query, { k: topK });', lineNumber: 42 },
    { sign: ' ', text: '  return hits.map(toDocument);', lineNumber: 43 },
    { sign: ' ', text: '}', lineNumber: 44 },
  ],
  comment: {
    author: { ar: 'اسم المهندس قيد التحديد', en: 'Engineer name pending' },
    body: {
      ar: 'ثبّت topK في الإعدادات بدل تمريره من هنا، وأضف حالة اختبار تثبت أن التغيير لا يكسر الترتيب.',
      en: 'Pin topK in config rather than threading it through here, and add a case that proves the change does not alter ranking.',
    },
    anchorLine: 3,
  },
  placeholder: true,
  blockedBy: 'a real review comment cleared for publication',
};
