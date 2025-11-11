import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Bird, Flower, Trees } from 'lucide-react';
import type { Identification } from '@/lib/types';
import { Separator } from './ui/separator';

const iconMap: { [key: string]: React.ReactNode } = {
  bird: <Bird className="h-4 w-4 text-muted-foreground" />,
  flower: <Flower className="h-4 w-4 text-muted-foreground" />,
  tree: <Trees className="h-4 w-4 text-muted-foreground" />,
  butterfly: <span className="text-xl">🦋</span>,
};

interface IdentificationHistoryProps {
  history: Identification[];
}

export default function IdentificationHistory({ history }: IdentificationHistoryProps) {
  return (
    <Card className='mt-8'>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <History />
          Identification History
        </CardTitle>
        <CardDescription>Your past identifications are saved here.</CardDescription>
      </CardHeader>
       <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          {history.length > 0 ? (
            <div className="space-y-1 p-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                  <Image
                    src={item.imageUrl}
                    alt={item.speciesName}
                    width={56}
                    height={56}
                    className="rounded-md object-cover aspect-square border"
                    data-ai-hint={item.imageHint}
                  />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {iconMap[item.imageHint] || <Bird className="h-4 w-4 text-muted-foreground" />}
                      {item.speciesName}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.userDescription || 'No description provided.'}</p>
                  </div>
                  <div className="text-sm text-muted-foreground self-start pt-1">{item.createdAt}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
                <p className="text-muted-foreground">No identification history yet.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
