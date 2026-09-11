'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A modal at the top elevation, on the native <dialog> element — so focus
 * trapping, Escape and the backdrop come from the platform rather than from a
 * script. The backdrop is ambient darkness, not a color.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" onClose={onClose}>
      <h2 className="dialog-title">{title}</h2>
      <div className="dialog-body">{children}</div>
      {actions ? <div className="dialog-actions">{actions}</div> : null}
    </dialog>
  );
}
