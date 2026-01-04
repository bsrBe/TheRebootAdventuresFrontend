import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/hooks/useTelegram";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phoneNumber: z.string().trim().regex(/^\+251\d{9}$/, "Phone number must be in format +251XXXXXXXXX"),
  age: z.coerce.number().min(18, "Age must be at least 18").max(60, "Age must be at most 60"),
  weight: z.coerce.number().min(35, "Weight must be at least 35 kg").max(100, "Weight must be at most 100 kg"),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  horseRidingExperience: z.string().min(1, "Please select an option"),
  referralSource: z.string().trim().min(1, "Please let us know how you heard about us").max(200, "Response must be less than 200 characters"),
});

type FormValues = z.infer<typeof formSchema>;

import { useNavigate } from "react-router-dom";

export function RegistrationForm() {
  const { user } = useTelegram();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "+251",
      age: undefined,
      weight: undefined,
      height: undefined,
      horseRidingExperience: "",
      referralSource: "",
    },
  });



  const registerUserMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const registrationData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        age: data.age,
        weight: data.weight,
        height: data.height,
        horseRidingExperience: data.horseRidingExperience,
        referralSource: data.referralSource,
        telegramData: user || null,
      };
      return api.registerUser(registrationData);
    },
    onSuccess: () => {
      toast.success("Registration submitted successfully!", {
        description: "Redirecting to events page...",
      });

      // Redirect to events page after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    },
  });

  function onSubmit(values: FormValues) {
    registerUserMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="bg-input border-border text-foreground" />
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
              <FormLabel className="text-foreground">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} className="bg-input border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Phone Number (+251...)</FormLabel>
              <FormControl>
                <Input placeholder="+251912345678" {...field} className="bg-input border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Age (18-60)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="25" {...field} className="bg-input border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Weight (kg) (35-100)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="70" {...field} className="bg-input border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Height (cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="175" {...field} className="bg-input border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horseRidingExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Do you have horse riding experience?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">No experience</SelectItem>
                  <SelectItem value="beginner">Beginner (1-5 rides)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (5-20 rides)</SelectItem>
                  <SelectItem value="advanced">Advanced (20+ rides)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referralSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Where did you hear about us?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Telegram">Telegram</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          disabled={registerUserMutation.isPending}
        >
          {registerUserMutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Register Now'
          )}
        </Button>
      </form>
    </Form>
  );
}
