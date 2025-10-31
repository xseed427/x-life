
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Stethoscope, User, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doctorSpecialties, vetSpecialties } from '@/lib/specialties';
import { useAuth } from '@/contexts/auth-context';

type Role = 'customer' | 'vendor' | 'superadmin';

const baseSignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

const customerSignUpSchema = baseSignUpSchema;
const superAdminSignUpSchema = baseSignUpSchema;

const vendorSignUpSchema = baseSignUpSchema.extend({
  vendorType: z.string().min(1, { message: 'Please select a vendor type.' }),
  specialty: z.string().optional(),
  experience: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, { message: "Experience cannot be negative." }).optional()
  ),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const VENDOR_TYPES = ["Doctor", "Vet Doctor", "Pharmacy", "Retailer"];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db } = useAuth();


  const customerSignUpForm = useForm<z.infer<typeof customerSignUpSchema>>({
    resolver: zodResolver(customerSignUpSchema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const vendorSignUpForm = useForm<z.infer<typeof vendorSignUpSchema>>({
    resolver: zodResolver(vendorSignUpSchema),
    defaultValues: { name: '', email: '', password: '', phone: '', vendorType: '', specialty: '', experience: undefined },
  });

  const superAdminSignUpForm = useForm<z.infer<typeof superAdminSignUpSchema>>({
    resolver: zodResolver(superAdminSignUpSchema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });
  
  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const watchedVendorType = vendorSignUpForm.watch('vendorType');

  const getSpecialties = () => {
    switch (watchedVendorType) {
      case 'Doctor':
        return doctorSpecialties;
      case 'Vet Doctor':
        return vetSpecialties;
      default:
        return [];
    }
  };

  const showSpecialtyAndExperience = watchedVendorType === 'Doctor' || watchedVendorType === 'Vet Doctor';


  const handleSignUp = async (values: z.infer<typeof customerSignUpSchema> | z.infer<typeof vendorSignUpSchema> | z.infer<typeof superAdminSignUpSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      
      // await sendEmailVerification(userCredential.user);

      const userData: any = {
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: role,
        createdAt: new Date(),
      };

      if (role === 'vendor' && 'vendorType' in values) {
        userData.vendorType = values.vendorType;
        if (showSpecialtyAndExperience && values.specialty) {
          userData.specialty = values.specialty;
        }
        if (showSpecialtyAndExperience && values.experience) {
          userData.experience = values.experience;
        }
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      toast({ 
        title: 'Account created successfully!',
        description: 'You can now sign in with your new account.'
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "An unexpected error occurred.";
      toast({ variant: 'destructive', title: 'Sign-up failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Signed in successfully!' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign-in failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const RoleButton = ({ value, children }: { value: Role, children: React.ReactNode }) => (
    <Button 
      variant={role === value ? 'default' : 'outline'}
      onClick={() => setRole(value)}
      className="flex-1"
    >
      {children}
    </Button>
  );

  const PasswordField = ({ control, name, label = "Password" }: { control: any, name: string, label?: string }) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...field}
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const getSignUpForm = () => {
    switch (role) {
      case 'customer':
        return (
          <Form {...customerSignUpForm}>
            <form onSubmit={customerSignUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField control={customerSignUpForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={customerSignUpForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={customerSignUpForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <PasswordField control={customerSignUpForm.control} name="password" />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        );
      case 'vendor':
        return (
          <Form {...vendorSignUpForm}>
            <form onSubmit={vendorSignUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField control={vendorSignUpForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name / Business Name</FormLabel><FormControl><Input placeholder="e.g. Dr. Jane Smith or City Pharmacy" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={vendorSignUpForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={vendorSignUpForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage/></FormItem>)} />
              <FormField control={vendorSignUpForm.control} name="vendorType" render={({ field }) => (<FormItem><FormLabel>Vendor Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a vendor type" /></SelectTrigger></FormControl><SelectContent>{VENDOR_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              
              {showSpecialtyAndExperience && (
                <>
                  <FormField control={vendorSignUpForm.control} name="specialty" render={({ field }) => (<FormItem><FormLabel>Specialty</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a specialty" /></SelectTrigger></FormControl><SelectContent>{getSpecialties().map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={vendorSignUpForm.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </>
              )}

              <PasswordField control={vendorSignUpForm.control} name="password" />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Vendor Account
              </Button>
            </form>
          </Form>
        );
      case 'superadmin':
         return (
           <Form {...superAdminSignUpForm}>
             <form onSubmit={superAdminSignUpForm.handleSubmit(handleSignUp)} className="space-y-4">
               <FormField control={superAdminSignUpForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Admin Name</FormLabel><FormControl><Input placeholder="Admin User" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={superAdminSignUpForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Admin Email</FormLabel><FormControl><Input placeholder="admin@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={superAdminSignUpForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <PasswordField control={superAdminSignUpForm.control} name="password" />
               <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Create Admin Account
               </Button>
             </form>
           </Form>
         );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2">
            <RoleButton value="customer"><User className="mr-2 h-4 w-4" /> Customer</RoleButton>
            <RoleButton value="vendor"><Stethoscope className="mr-2 h-4 w-4" /> Vendor</RoleButton>
            <RoleButton value="superadmin"><ShieldCheck className="mr-2 h-4 w-4" /> Admin</RoleButton>
        </div>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Sign in to continue to your {role} account.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <PasswordField control={signInForm.control} name="password" />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create a {role} account</CardTitle>
                <CardDescription>Enter your details to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                {getSignUpForm()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
