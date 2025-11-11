'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, UploadCloud, UserPlus } from 'lucide-react';
import { doctorSpecialties } from '@/lib/specialties';

interface DoctorRegistrationProps {
  onBack: () => void;
}

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().min(1, { message: "Please select a specialty." }),
  experience: z.coerce.number().min(0, { message: "Experience cannot be negative." }),
  profilePicture: z.any().refine(files => files?.length === 1, "Profile picture is required."),
});


export default function DoctorRegistration({ onBack }: DoctorRegistrationProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      specialty: '',
      experience: 0,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('profilePicture', event.target.files);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (values: z.infer<typeof registrationSchema>) => {
    setIsSubmitting(true);
    console.log("Doctor Registration Data:", values);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Successful!",
        description: `Dr. ${values.name} has been registered.`,
      });
      onBack();
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <div className="text-left">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UserPlus />
            Doctor Registration
          </h1>
          <p className="text-muted-foreground">Join our network of medical professionals.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Profile Picture</FormLabel>
                       <FormControl>
                        <div>
                        {imagePreview ? (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 mx-auto">
                                <Image src={imagePreview} alt="Profile preview" fill style={{ objectFit: 'cover' }} />
                            </div>
                        ) : (
                          <label htmlFor="image-upload" className="relative group cursor-pointer">
                              <div className="w-32 h-32 mx-auto flex flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-input bg-background hover:bg-accent">
                                  <UploadCloud className="h-8 w-8 text-muted-foreground transition-all group-hover:scale-110 group-hover:text-primary" />
                              </div>
                              <Input
                                  id="image-upload"
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  accept="image/png, image/jpeg"
                                  onChange={handleImageChange}
                              />
                          </label>
                        )}
                        </div>
                       </FormControl>
                       <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a specialty" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {doctorSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Register Now
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
