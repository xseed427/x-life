'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Pill, PlusCircle, Trash2, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMedicineName } from '@/app/actions';
import type { Medicine } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MedicineSchedulerProps {
  onBack: () => void;
}

const DOSAGE_OPTIONS = ["-", "1/4", "1/2", "2/3", "1"];

export default function MedicineScheduler({ onBack }: MedicineSchedulerProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMedicine, setCurrentMedicine] = useState<Partial<Medicine>>({ meal: 'after' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isIdentifying, startIdentifying] = useTransition();
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setCurrentMedicine(prev => ({ ...prev, imageUrl: result }));

        const formData = new FormData();
        formData.append('image', file);
        startIdentifying(async () => {
          const { data, error } = await getMedicineName(formData);
          if (error) {
            toast({ variant: 'destructive', title: 'Could not identify medicine', description: error });
            setCurrentMedicine(prev => ({ ...prev, name: '' }));
          } else if (data) {
            setCurrentMedicine(prev => ({ ...prev, name: data.medicineName }));
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMedicine = () => {
    if (!currentMedicine.name || !currentMedicine.imageUrl) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a medicine name and image.' });
      return;
    }

    const newMedicine: Medicine = {
      id: new Date().toISOString(),
      name: currentMedicine.name,
      imageUrl: currentMedicine.imageUrl,
      meal: currentMedicine.meal || 'after',
      breakfast: currentMedicine.breakfast || '-',
      lunch: currentMedicine.lunch || '-',
      dinner: currentMedicine.dinner || '-',
    };

    setMedicines(prev => [...prev, newMedicine]);
    // Reset for next entry
    setCurrentMedicine({ meal: 'after' });
    setImagePreview(null);
  };
  
  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  }

  const resetCurrentMedicine = () => {
    setCurrentMedicine({ meal: 'after' });
    setImagePreview(null);
  }

  return (
    <div className="w-full space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="text-primary" />
              <span>Add New Medicine</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack}><X className="h-4 w-4" /> <span className="sr-only">Back</span></Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!imagePreview ? (
             <label htmlFor="medicine-upload" className="relative group cursor-pointer">
                <div className="flex flex-col h-32 w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-input bg-background hover:bg-accent">
                    <UploadCloud className="h-8 w-8 text-muted-foreground transition-all group-hover:scale-110 group-hover:text-primary" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary">Upload Medicine Photo</span>
                </div>
                <Input
                    id="medicine-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    onChange={handleImageChange}
                />
            </label>
          ) : (
             <div className="space-y-4">
               <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <Image src={imagePreview} alt="Medicine preview" fill style={{ objectFit: 'contain' }} className="rounded-lg" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={resetCurrentMedicine}>
                    <X className="h-4 w-4" />
                  </Button>
               </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicine-name">Medicine Name</Label>
                  <Input
                    id="medicine-name"
                    placeholder="e.g. Paracetamol"
                    value={currentMedicine.name || ''}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isIdentifying}
                  />
                  {isIdentifying && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                      <Loader2 className="h-4 w-4 animate-spin"/>
                      <span>Identifying...</span>
                    </div>
                  )}
                </div>
             </div>
          )}

          <div className={cn("space-y-4", !imagePreview || isIdentifying ? "opacity-50 pointer-events-none" : "")}>
            <div className="space-y-2">
                <Label>When to take?</Label>
                <RadioGroup
                  value={currentMedicine.meal}
                  onValueChange={(value) => setCurrentMedicine(prev => ({ ...prev, meal: value as 'before' | 'after' }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="before" id="before" />
                    <Label htmlFor="before">Before Food</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after" id="after" />
                    <Label htmlFor="after">After Food</Label>
                  </div>
                </RadioGroup>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map((mealTime) => (
                <div key={mealTime} className="space-y-1">
                   <Label htmlFor={`${mealTime}-dosage`} className="capitalize">{mealTime}</Label>
                   <Select
                    value={currentMedicine[mealTime as keyof typeof currentMedicine] || '-'}
                    onValueChange={(value) => setCurrentMedicine(prev => ({ ...prev, [mealTime]: value }))}
                   >
                     <SelectTrigger id={`${mealTime}-dosage}`}>
                       <SelectValue placeholder="Dosage" />
                     </SelectTrigger>
                     <SelectContent>
                       {DOSAGE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
              ))}
            </div>

            <Button onClick={handleAddMedicine} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {medicines.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Current Medication Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Meal Time</TableHead>
                            <TableHead>Breakfast</TableHead>
                            <TableHead>Lunch</TableHead>
                            <TableHead>Dinner</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {medicines.map(med => (
                            <TableRow key={med.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  <Image src={med.imageUrl} alt={med.name} width={32} height={32} className="rounded-sm object-contain" />
                                  {med.name}
                                </TableCell>
                                <TableCell className="capitalize">{med.meal} Food</TableCell>
                                <TableCell>{med.breakfast}</TableCell>
                                <TableCell>{med.lunch}</TableCell>
                                <TableCell>{med.dinner}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => removeMedicine(med.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      )}

    </div>
  );
}
