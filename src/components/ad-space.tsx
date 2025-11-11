'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { adConfig, ads } from '@/lib/ad-config';

export default function AdSpace() {
  const plugin = React.useRef(
    Autoplay({ delay: adConfig.autoplayDelay, stopOnInteraction: true })
  );

  return (
    <div className="sticky top-20">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {ads.map((ad) => (
            <CarouselItem key={ad.id}>
              <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        data-ai-hint={ad.imageHint}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">{ad.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}
