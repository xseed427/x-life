'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Dog, Bird, User, Leaf, Pill, Users, ShoppingCart, Fish } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categories = [
  { name: 'Animal', icon: <Dog className="h-8 w-8" /> },
  { name: 'Bird', icon: <Bird className="h-8 w-8" /> },
  { name: 'Fish', icon: <Fish className="h-8 w-8" /> },
  { name: 'Human', icon: <User className="h-8 w-8" /> },
  { name: 'Plant', icon: <Leaf className="h-8 w-8" /> },
  { name: 'Medicine', icon: <Pill className="h-8 w-8" /> },
];

const shopVendors = ['Pharmacy', 'Pet care', 'Nursery', 'Aqua life', 'Laboratory'];

export default function CategoryIcons({
  isHeader,
  onCategoryClick,
  selectedCategory,
  onVendorClick,
}: {
  isHeader?: boolean;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
  onVendorClick?: (vendor: string) => void;
}) {
  if (isHeader) {
    return (
      <div className="flex items-center gap-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.name}
              className={cn(
                'group flex flex-col items-center justify-center p-2 rounded-lg transition-colors h-14 w-14 hover:bg-muted',
                isSelected && 'bg-primary/10 ring-2 ring-primary/50'
              )}
              onClick={() => onCategoryClick?.(category.name)}
            >
              {React.cloneElement(category.icon, {
                className: cn(
                  'h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors',
                  isSelected && 'text-primary'
                ),
              })}
              <span
                className={cn(
                  'text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors',
                  isSelected && 'text-primary'
                )}
              >
                {category.name}
              </span>
            </button>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'group flex flex-col items-center justify-center p-2 rounded-lg transition-colors h-14 w-14 hover:bg-muted'
              )}
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span
                className={cn(
                  'text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors'
                )}
              >
                Shop
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {shopVendors.map((vendor) => (
              <DropdownMenuItem key={vendor} onClick={() => onVendorClick?.(vendor)}>
                {vendor}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Card className="max-w-screen-2xl container shadow-sm">
      <div className="flex justify-center items-center gap-6 md:gap-12 p-4">
        {categories.map((category) => (
          <button
            key={category.name}
            className="group flex flex-col items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted"
            onClick={() => onCategoryClick?.(category.name)}
          >
            {React.cloneElement(category.icon, {
              className:
                'h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors',
            })}
            <span className="text-sm font-semibold text-foreground transition-colors">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
