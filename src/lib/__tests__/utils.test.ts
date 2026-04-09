import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', 'conditional')).toBe('base conditional')
      expect(cn('base')).toBe('base')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })

    it('merges conflicting Tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('handles objects with boolean values', () => {
      expect(cn({
        'active': true,
        'disabled': false,
        'hidden': true
      })).toBe('active hidden')
    })

    it('handles mixed input types', () => {
      expect(cn(
        'base',
        ['array1', 'array2'],
        { 'object': true, 'disabled': false },
        'string',
        undefined
      )).toBe('base array1 array2 object string')
    })
  })
})
