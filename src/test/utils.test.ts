/**
 * SGG Digital — Tests des utilitaires
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className merger)', () => {
  it('should merge simple class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conflicting Tailwind classes (last wins)', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('active-class');
  });

  it('should handle false/null/undefined values', () => {
    const result = cn('base', false, null, undefined, '', 'end');
    expect(result).toBe('base end');
  });

  it('should merge padding conflicts', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('should keep non-conflicting classes', () => {
    const result = cn('px-4 py-2', 'mt-4');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('mt-4');
  });
});
