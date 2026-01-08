import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Bot, MessageCircle, Send, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { BlinkBlur } from 'react-loading-indicators'
import { Chat } from '@/services/ChatbotService';

interface FloatingChatButtonProps {
    onToggle?: (isOpen: boolean) => void;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export default function FloatingChatButton({ onToggle }: FloatingChatButtonProps) {
    const [isChatStarted, setChatStarted] = useState(false);
    const [inputValue, setInputValue] = useState(''); // State untuk value textarea
    const [isAnalyze, setAnalyze] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]); // State untuk menyimpan pesan
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State untuk track drawer

    // Ref untuk auto scroll di dalam ScrollArea
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { auth } = usePage().props as any;
    const user = auth?.user;

    // Auto scroll ke bawah saat ada pesan baru atau loading
    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Scroll saat ada pesan baru atau loading
    useEffect(() => {
        scrollToBottom();
    }, [messages, isAnalyze]);

    // Scroll ke chat terakhir saat drawer dibuka
    useEffect(() => {
        if (isDrawerOpen && messages.length > 0) {
            // Delay sedikit agar drawer fully rendered
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isDrawerOpen]);

    // Fungsi untuk mengirim pesan
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAnalyze) return; // Jangan kirim jika kosong

        // Tambah pesan user
        const newMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newMessage]);
        setChatStarted(true);
        setInputValue(''); // Reset textarea
        setAnalyze(true)

        try {
            // Panggil API dengan text dari input user
            const response = await Chat(inputValue);

            const botResponse: Message = {
                id: Date.now() + 1,
                text: response.reply || 'Maaf, terjadi kesalahan.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            const errorResponse: Message = {
                id: Date.now() + 1,
                text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setAnalyze(false);
        }
    };

    const handleSendMessageWithText = async (text: string) => {
        if (isAnalyze) return

        const newMessage: Message = {
            id: Date.now(),
            text: text,
            sender: 'user'
        };

        setMessages(prev => [...prev, newMessage]);
        setChatStarted(true);
        setAnalyze(true)

        try {
            const response = await Chat(text);

            const botResponse: Message = {
                id: Date.now() + 1,
                text: response.reply || 'Maaf, terjadi kesalahan.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            const errorResponse: Message = {
                id: Date.now() + 1,
                text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setAnalyze(false);
        }
    };

    // Fungsi untuk quick action
    const handleQuickAction = (text: string) => {
        handleSendMessageWithText(text);
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <Drawer onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <button
                        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-40 h-10 rounded-md bg-red-500 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none"
                        aria-label="Toggle chat"
                        title="Buka chat"
                    >
                        <div className='flex gap-3 items-center'>
                            <Bot /> <p className='font-bold'>SADA CS</p>
                        </div>
                    </button>
                </DrawerTrigger>
                <DrawerContent className="h-[100dvh] max-h-[100dvh] overflow-hidden">
                    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
                        {/* Header */}
                        <DrawerHeader className="flex-shrink-0 border-b">
                            <DrawerTitle>Chat Dengan SADA AI</DrawerTitle>
                            <DrawerDescription>Kami siap membantu Anda 24 x 7</DrawerDescription>
                        </DrawerHeader>

                        {/* Chat Content - Scrollable Area */}
                        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 h-30">
                            {!isChatStarted ?
                                (
                                    <div className='mt-5'>
                                        <p className='text-foreground font-bold text-center'>Halo {user?.name} 👋, ada yang bisa SADA AI bantu?</p>
                                        <div className='mt-6 flex flex-col w-full'>
                                            <button
                                                onClick={() => handleQuickAction('Membuat jadwal meeting')}
                                                className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'
                                            >
                                                <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                                <span className='text-foreground text-left'>Membuat jadwal meeting</span>
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction('Melaporkan bug')}
                                                className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'
                                            >
                                                <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                                <span className='text-foreground text-left'>Melaporkan bug</span>
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction('Apa saja metode pembayarannya')}
                                                className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'
                                            >
                                                <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                                <span className='text-foreground text-left'>Apa saja metode pembayarannya</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Chat Messages */
                                    <div className='mt-6 flex flex-col gap-4'>

                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} gap-3 items-center`}
                                            >
                                                {message.sender != 'user' ? <Bot /> : <div></div>}
                                                <div
                                                    className={`max-w-[80%] px-4 py-2 rounded-lg ${message.sender === 'user'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-muted text-foreground'
                                                        }`}
                                                >
                                                    {message.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isAnalyze && <div className='px-4 '><BlinkBlur color="#666666" size="small" text="" textColor="" /></div>}
                                    </div>
                                )
                            }
                        </ScrollArea>

                        {/* Input Area - Fixed at bottom */}
                        <DrawerFooter className="flex-shrink-0 border-t p-4">
                            <Textarea
                                placeholder='Apa yang ingin anda tanyakan?'
                                className='mb-3 min-h-[100px] resize-none'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Kirim
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
