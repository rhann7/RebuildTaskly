import { useState } from 'react';
import { ArrowUpRight, Bot, MessageCircle, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

interface FloatingChatButtonProps {
    onToggle?: (isOpen: boolean) => void;
}

export default function FloatingChatButton({ onToggle }: FloatingChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { auth } = usePage().props as any;
    const user = auth?.user;

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onToggle?.(newState);
    };

    return (
        <>
            {/* Floating Button */}
            <Drawer>
                <DrawerTrigger asChild>
                    <button
                        onClick={handleToggle}
                        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-40 h-10 rounded-md bg-red-500 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none"
                        aria-label="Toggle chat"
                        title="Buka chat"
                    >
                        <div className='flex gap-3 items-center'>
                            <Bot /> <p className='font-bold'>SADA CS</p>
                        </div>
                    </button>
                </DrawerTrigger>
                <DrawerContent className="h-[100dvh] max-h-[100dvh]">
                    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
                        {/* Header */}
                        <DrawerHeader className="flex-shrink-0 border-b">
                            <DrawerTitle>Chat Dengan SADA AI</DrawerTitle>
                            <DrawerDescription>Kami siap membantu Anda 24 x 7</DrawerDescription>
                        </DrawerHeader>

                        {/* Chat Content - Scrollable Area */}
                        <ScrollArea className="flex-1 px-4 py-6">
                            <p className='mt-5 text-foreground font-bold text-center'>Halo {user?.name} 👋, ada yang bisa SADA AI bantu?</p>

                            {/* Quick Actions */}
                            <div className='mt-6 flex flex-col w-full'>
                                <button className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'>
                                    <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                    <span className='text-foreground text-left'>Membuat jadwal meeting</span>
                                </button>
                                <button className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'>
                                    <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                    <span className='text-foreground text-left'>Melaporkan bug</span>
                                </button>
                                <button className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'>
                                    <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                    <span className='text-foreground text-left'>Membayar dengan apa</span>
                                </button>
                            </div>
                        </ScrollArea>

                        {/* Input Area - Fixed at bottom */}
                        <DrawerFooter className="flex-shrink-0 border-t p-4">
                            <Textarea placeholder='Apa yang ingin anda tanyakan?' className='mb-3 min-h-[100px] resize-none' />
                            <Button variant="outline" className="w-full">Kirim</Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
