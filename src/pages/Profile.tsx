import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

const formSchema = z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    phoneNumber: z.string().trim().regex(/^\+251\d{9}$/, "Phone number must be in format +251XXXXXXXXX"),
    age: z.coerce.number().min(18, "Age must be at least 18").max(60, "Age must be at most 60"),
    weight: z.coerce.number().min(35, "Weight must be at least 35 kg").max(100, "Weight must be at most 100 kg"),
    height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
    horseRidingExperience: z.string().min(1, "Please select an option"),
});

type FormValues = z.infer<typeof formSchema>;

const Profile = () => {
    const { user, isReady } = useTelegram();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string | null>(null);

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
        },
    });

    // Fetch user data
    useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            try {
                const response = await api.getUserByTelegramId(user.id);
                if (response?.data) {
                    const userData = response.data;
                    setUserId(userData._id);
                    form.reset({
                        fullName: userData.fullName || "",
                        email: userData.email || "",
                        phoneNumber: userData.phoneNumber || "+251",
                        age: userData.age,
                        weight: userData.weight,
                        height: userData.height,
                        horseRidingExperience: userData.horseRidingExperience || "",
                    });
                    return userData;
                }
                return null;
            } catch (error) {
                console.error("Error fetching user:", error);
                return null; // Handle error gracefully (maybe redirect to registration?)
            }
        },
        enabled: !!user?.id,
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: FormValues) => {
            if (!userId) throw new Error("User ID not found");
            return api.updateUser(userId, data);
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            // Invalidate queries to refresh data if needed elsewhere
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: Error) => {
            toast.error("Update failed", {
                description: error.message || "Please try again later.",
            });
        },
    });

    function onSubmit(values: FormValues) {
        updateProfileMutation.mutate(values);
    }

    if (!isReady) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-lg mx-auto px-4 py-6">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => {
                    if (window.history.length > 2) {
                        navigate(-1);
                    } else {
                        navigate('/events');
                    }
                }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Your Profile</h1>
                        <p className="text-muted-foreground text-sm">Manage your personal information</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                        <Input type="email" placeholder="john@example.com" {...field} />
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
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+251912345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
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
                                        <FormLabel>Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
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
                                        <FormLabel>Height (cm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="horseRidingExperience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Riding Experience</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
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

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default Profile;
