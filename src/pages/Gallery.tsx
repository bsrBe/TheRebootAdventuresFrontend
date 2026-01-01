import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Camera, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Memory {
    _id: string;
    photoUrl: string;
    caption: string;
    event: {
        name: string;
    };
    createdAt: string;
}

const Gallery = () => {
    const navigate = useNavigate();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchMemories = async (pageNum: number, isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const response = await api.getPublicMemories(pageNum, 12);
            const { data, pagination } = response;

            if (isInitial) {
                setMemories(data || []);
            } else {
                setMemories(prev => [...prev, ...(data || [])]);
            }

            setHasMore(pagination.page < pagination.totalPages);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            toast.error('Failed to load gallery');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchMemories(1, true);
    }, []);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMemories(nextPage);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 sm:p-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="space-y-4 text-center">
                        <Skeleton className="h-10 w-48 mx-auto" />
                        <Skeleton className="h-6 w-64 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative h-48 sm:h-64 overflow-hidden mb-8">
                <div className="absolute inset-0 bg-black/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <div className="w-full flex justify-start mb-4">
                        <Button variant="ghost" size="sm" onClick={() => {
                            if (window.history.length > 2) {
                                navigate(-1);
                            } else {
                                navigate('/events');
                            }
                        }} className="text-white/60 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
                        Trip Gallery
                    </h1>
                    <p className="text-white/70 max-w-md">
                        Relive the best moments from our recent Reboot Adventures through the eyes of our community.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20">
                {memories.length === 0 ? (
                    <div className="text-center py-20">
                        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">The gallery is empty for now. Check back after our next trip!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {memories.map((memory) => (
                            <div key={memory._id} className="group relative">
                                <Card className="overflow-hidden border-none bg-accent/5 aspect-[4/5] rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="absolute inset-0">
                                        <img
                                            src={memory.photoUrl}
                                            alt={memory.caption || 'Trip Memory'}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    </div>

                                    <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-primary/20 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold text-primary-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {memory.event?.name}
                                            </div>
                                            <div className="text-[10px] text-white/60 flex items-center gap-1 uppercase tracking-wider font-medium">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(memory.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium leading-relaxed line-clamp-2 italic text-white/90">
                                            "{memory.caption || 'No caption provided'}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {hasMore && (
                <div className="flex justify-center pb-10">
                    <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        disabled={loadingMore}
                        className="min-w-[150px]"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}

            {/* CTA */}
            <div className="bg-accent/5 border-t border-white/5 py-16 text-center">
                <h3 className="text-xl font-bold mb-3">Want your photos here?</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm px-4">
                    Send your trip photos to our Telegram bot after your adventure. If approved, you'll be featured right here!
                </p>
                <Button onClick={() => window.open('https://t.me/Reboot_Adventures_bot', '_blank')}>
                    Open Telegram Bot
                </Button>
            </div>
        </div>
    );
};

export default Gallery;
