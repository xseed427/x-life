'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, X } from 'lucide-react';
import { doctors } from '@/lib/doctors';
import type { Doctor } from '@/lib/types';
import { cn } from '@/lib/utils';
import { doctorSpecialties } from '@/lib/specialties';

const popularSpecialties = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'General Physician',
];


export default function FindADoctor({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = doctorSpecialties.filter(specialty =>
        specialty.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredSpecialties(filtered);
      setIsDropdownVisible(filtered.length > 0);
    } else {
      setFilteredSpecialties([]);
      setIsDropdownVisible(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSpecialtyClick = (specialtyName: string) => {
    setSearchTerm(specialtyName);
    setIsDropdownVisible(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold font-headline mt-2">Find a Doctor</h1>
        <p className="text-muted-foreground mt-2">
          Search for a specialist and start your consultation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or specialty (e.g. 'Dermatologist')"
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownVisible(searchTerm.length > 0 && filteredSpecialties.length > 0)}
          />
           {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
          {isDropdownVisible && (
            <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                <ul>
                  {filteredSpecialties.map(specialty => (
                    <li
                      key={specialty}
                      className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
                      onClick={() => handleSpecialtyClick(specialty)}
                    >
                      {specialty}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Popular:</span>
            {popularSpecialties.map(specialty => (
                <Button 
                    key={specialty} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSpecialtyClick(specialty)}
                    className="rounded-full"
                >
                    {specialty}
                </Button>
            ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor: Doctor) => (
            <Card key={doctor.id} className="flex items-center p-4 gap-4 hover:bg-muted/50 transition-colors">
              <Image
                src={doctor.imageUrl}
                alt={`Dr. ${doctor.name}`}
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-primary/50"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary">Dr. {doctor.name}</h3>
                <p className="font-semibold text-foreground">{doctor.specialty}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Availability: <span className="text-green-600 font-medium">{doctor.availability}</span>
                </p>
              </div>
              <Button size="lg">Consult Now</Button>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors found matching your search.</p>
          </div>
        )}
      </div>
      <div className="text-center">
        <Button variant="link" onClick={onRegisterClick}>
          Are you a doctor? Register here
        </Button>
      </div>
    </div>
  );
}
