'use client';
import Header from '@/components/header';
import QueryClientPage from '@/components/query-client-page';
import { useState } from 'react';
import AdSpace from '@/components/ad-space';

export default function MainApp() {
  const [blink, setBlink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedVendor(null); // Clear vendor selection
    }

    if(category === 'Animal' || category === 'Plant' || category === 'Bird' || category === 'Human' || category === 'Medicine' || category === 'Fish') {
      setBlink(true);
      setTimeout(() => setBlink(false), 1000);
    }
  };

  const handleVendorClick = (vendor: string) => {
    setSelectedVendor(vendor);
    setSelectedCategory(null); // Clear category selection
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        onCategoryClick={handleCategoryClick} 
        selectedCategory={selectedCategory}
        onVendorClick={handleVendorClick} 
      />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                    <AdSpace />
                </div>
                <div className="md:col-span-8 mt-8 md:mt-0">
                    <div className="flex justify-center">
                        <QueryClientPage 
                            blink={blink} 
                            selectedCategory={selectedCategory}
                            selectedVendor={selectedVendor}
                        />
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
