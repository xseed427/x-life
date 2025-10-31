'use client';

import { cn } from '@/lib/utils';
import CategoryIcons from './category-icons';

export default function Header({
  onCategoryClick,
  selectedCategory,
  onVendorClick,
}: {
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
  onVendorClick?: (vendor: string) => void;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <a href="/" className="flex items-center space-x-2 group">
          <svg
            className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15.5 15.5L19 19" />
            <path d="M5 11a7 7 0 1 0 14 0 7 7 0 1 0-14 0z" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <div>
            <span className="font-bold font-headline text-2xl group-hover:text-primary transition-colors">
              HealthCheck
            </span>
            <p className="text-xs text-muted-foreground -mt-1 text-right">
              Stay Updated
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <CategoryIcons 
            isHeader={true} 
            onCategoryClick={onCategoryClick} 
            selectedCategory={selectedCategory} 
            onVendorClick={onVendorClick}
          />
        </div>
      </div>
    </header>
  );
}
