'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ArrowLeft } from 'lucide-react';
import { shops } from '@/lib/shops';
import type { Shop } from '@/lib/types';

interface VendorShopsProps {
  vendorCategory: string;
  onBack: () => void;
}

export default function VendorShops({ vendorCategory, onBack }: VendorShopsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = shops.filter(shop =>
    shop.category.toLowerCase() === vendorCategory.toLowerCase() &&
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <div className="text-left">
                <h1 className="text-3xl font-bold font-headline">{vendorCategory}</h1>
                <p className="text-muted-foreground">Find a shop near you.</p>
            </div>
      </div>


      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search in ${vendorCategory}...`}
          className="pl-10 h-12 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.length > 0 ? (
          filteredShops.map((shop: Shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
               <div className="relative h-40 w-full">
                    <Image
                        src={shop.imageUrl}
                        alt={`${shop.name}`}
                        fill
                        className="object-cover"
                    />
               </div>
              <CardHeader>
                <CardTitle className="text-lg">{shop.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{shop.location}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No shops found for "{vendorCategory}" matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
