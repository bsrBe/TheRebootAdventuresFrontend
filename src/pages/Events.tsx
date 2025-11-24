import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Event {
    _id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    price: number;
    capacity: number;
    isActive: boolean;
}

interface RegisteredEvent {
    eventId: string;
    status: string;
}

const Events = () => {
    const { user: telegramUser } = useTelegram();
    const [events, setEvents] = useState<Event[]>([]);
    const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [signingUp, setSigningUp] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch events
                const eventsData = await api.getEvents();
                setEvents(eventsData.data || []);

                // Fetch user registration status if telegram user exists
                if (telegramUser?.id) {
                    const userData = await api.getUserByTelegramId(telegramUser.id);
                    if (userData && userData.data) {
                        setUserId(userData.data._id || userData.data.id);
                        const registered = new Set<string>(
                            (userData.data.registeredEvents || []).map((e: any) => e.eventId)
                        );
                        setRegisteredEventIds(registered);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [telegramUser]);

    const handleSignup = async (eventId: string) => {
        if (!userId) {
            toast.error('Please register first');
            return;
        }

        setSigningUp(eventId);
        try {
            await api.signupForEvent(eventId, userId);
            toast.success('Successfully signed up!');
            setRegisteredEventIds(prev => new Set(prev).add(eventId));
        } catch (error: any) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Failed to sign up');
        } finally {
            setSigningUp(null);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 pb-20">
            <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>

            {events.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No active events found.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => {
                        const isRegistered = registeredEventIds.has(event._id);

                        return (
                            <Card key={event._id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{event.name}</CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(event.date).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={isRegistered ? "secondary" : "default"}>
                                            {event.price} ETB
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                        {event.description}
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>Capacity: {event.capacity}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {isRegistered ? (
                                        <Button variant="secondary" className="w-full" disabled>
                                            Registered ✓
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleSignup(event._id)}
                                            disabled={signingUp === event._id || !userId}
                                        >
                                            {signingUp === event._id ? 'Signing up...' : 'Sign Up'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Events;
