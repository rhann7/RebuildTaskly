import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Bot, CornerUpLeft, MessageCircle, Send, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { BlinkBlur } from 'react-loading-indicators'
import { Chat } from '@/services/ChatbotService';
import { useSpring, useSpringRef, config, useTransition, useChain, animated } from '@react-spring/web'
import dataListFeature from '../../types/data-list-feature';
import { ActionAgent, ActionChatbot } from '../../types/data-fast-action';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { AgentTask } from '@/services/AgentAIService';

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
    const [previewValue, setPreviewValue] = useState('');
    const [isAnalyze, setAnalyze] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]); // State untuk menyimpan pesan
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State untuk track drawer
    const [open, setOpen] = useState(false)
    const [showTransition, setShowTransition] = useState(false)
    const [aiType, setAiType] = useState<string[]>([])
    const [selectedAiType, setSelectedAiType] = useState('') // State kosong dulu
    const [type, setType] = useState('')

    const springApi = useSpringRef()
    const { size, ...rest } = useSpring({
        ref: springApi,
        config: config.stiff,
        from: { size: '20%' },
        to: {
            size: open ? '100%' : '20%'
        }
    })

    const buttonSpring = useSpring({
        opacity: open ? 0 : 1,
        transform: open ? 'translateY(-20px)' : 'translateY(0px)',
        config: config.gentle
    })

    const filteredFeatures = dataListFeature.filter(item => item.type === type);
    const transApi = useSpringRef()
    const transition = useTransition(open ? filteredFeatures : [], {
        ref: transApi,
        trail: 400 / filteredFeatures.length,
        from: { opacity: 0, scale: 0 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 0 },
    })

    useChain(open ? [springApi, transApi] : [transApi, springApi], [
        0,
        open ? 0.1 : 0.6
    ])

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

    useEffect(() => {
        if (user.role !== 'company' && 'company-owner') {
            setAiType(['Agent', 'Chat'])
            setSelectedAiType('Chat')
        } else {
            setAiType(['Chat'])
            setSelectedAiType('Chat') // Set default value
        }
    }, [user?.role])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (open) {
            timer = setTimeout(() => {
                setShowTransition(true);
            }, 200);
        } else {
            setShowTransition(false);
        }
        return () => clearTimeout(timer);
    }, [open])

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAnalyze]);

    useEffect(() => {
        if (isDrawerOpen && messages.length > 0) {

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
            let response
            let responseText = ''

            if (selectedAiType.toLowerCase() == 'agent') {
                response = await AgentTask(inputValue)
                // AgentTask returns {agent_name, session_id, response}
                responseText = response.response || JSON.stringify(response)
            } else {
                response = await Chat(inputValue);
                responseText = response.reply || 'Tidak ada respons'
            }


            const botResponse: Message = {
                id: Date.now() + 1,
                text: responseText,
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
    }

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
            let response
            let responseText = ''

            if (selectedAiType.toLowerCase() == 'agent') {
                response = await AgentTask(text)
                // AgentTask returns {agent_name, session_id, response}
                responseText = response.response || 'Maaf, terjadi kesalahan!'
            } else {
                response = await Chat(text);
                responseText = response.reply || 'Maaf, terjadi kesalahan!'
            }

            const botResponse: Message = {
                id: Date.now() + 1,
                text: responseText,
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

    // Fungsi untuk clear messages
    const handleClearMessages = () => {
        setMessages([]);
        setChatStarted(false);
        setInputValue('');
        setAnalyze(false);
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
                            <Bot /> <p className='font-bold'>BRIZZ AI</p>
                        </div>
                    </button>
                </DrawerTrigger>
                <DrawerContent className="h-[100dvh] max-h-[100dvh] overflow-hidden">
                    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
                        {/* Header */}
                        <DrawerHeader className="flex-shrink-0 border-b">
                            <DrawerTitle>Chat Dengan BRIZZ AI</DrawerTitle>
                            <DrawerDescription>Kami siap membantu Anda 24 x 7</DrawerDescription>
                        </DrawerHeader>

                        {/* Chat Content - Scrollable Area */}
                        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 h-30">

                            {!isChatStarted ?
                                (
                                    <>
                                        <div className=''>
                                            <p className='text-foreground font-bold text-center'>Halo {user?.name} 👋, ada yang bisa SADA AI bantu?</p>

                                            {open && showTransition && (
                                                <div className='flex flex-wrap gap-2 mt-4 justify-center'>
                                                    <button
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <CornerUpLeft />
                                                    </button>
                                                    {transition((style, item) => (

                                                        <animated.div
                                                            key={item.id}
                                                            style={style}
                                                            className='bg-muted px-3 py-2 rounded-md cursor-pointer hover:bg-muted/80 transition-colors'
                                                            onMouseEnter={() => {
                                                                setPreviewValue(inputValue); // Simpan value asli
                                                                setInputValue(item.prompt ?? '');
                                                            }}
                                                            onMouseLeave={() => {
                                                                setInputValue(previewValue); // Kembalikan value asli
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setInputValue(item.prompt ?? '');
                                                                setPreviewValue('');
                                                                setOpen(false)
                                                            }}
                                                        >
                                                            {item.name_feat}
                                                        </animated.div>
                                                    ))}
                                                </div>
                                            )}

                                            {user.role == 'company' && 'company-owner' ?

                                                <div className='mt-6 flex flex-col w-full'>
                                                    {ActionChatbot.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleQuickAction('Membuat jadwal meeting')}
                                                            className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'
                                                        >
                                                            <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                                            <span className='text-foreground text-left'>{action.title}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                :

                                                <div className='mt-6 flex flex-col w-full'>
                                                    {ActionAgent.map((action, index) => (
                                                        <animated.div
                                                            key={index}
                                                            style={buttonSpring}
                                                            className={`${open ? 'pointer-events-none' : ''}`}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setOpen(true)
                                                                    setType(action.category)
                                                                }}
                                                                className='flex items-center gap-4 w-full py-4 px-2 hover:bg-muted/50 transition-colors border-b border-border'
                                                            >
                                                                <div className='flex items-center gap-4'>
                                                                    <ArrowUpRight size={18} className='text-foreground flex-shrink-0' />
                                                                    <span className='text-foreground text-left'>{action.title}</span>-<span className='text-gray-400'>{action.description}</span>
                                                                </div>
                                                            </button>
                                                        </animated.div>
                                                    ))}
                                                </div>

                                            }
                                        </div>

                                    </>
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
                            <div className="flex items-center justify-between mb-2">
                                <Select value={selectedAiType} onValueChange={setSelectedAiType}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {aiType.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {messages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearMessages}
                                        className="text-red-500"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Clear Messages
                                    </Button>
                                )}
                            </div>
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
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
