import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware Link / router. Use these everywhere instead of next/link and
 * next/navigation, so an internal link keeps the reader in their language.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
