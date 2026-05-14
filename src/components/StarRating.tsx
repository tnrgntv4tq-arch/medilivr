'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export default function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${readonly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${readonly ? '' : 'hover:scale-110 active:scale-95'}`}
        >
          <Star
            className={`${SIZES[size]} transition-colors ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-dark-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
