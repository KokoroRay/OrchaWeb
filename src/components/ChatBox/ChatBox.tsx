import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../services/chatService';
import { ChatService } from '../../services/chatService';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './ChatBox.module.css';

// SVG Icons
const ChatIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SparkleIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 7l-10 10M2 12h20M7 17l10-10"></path>
    </svg>
);

export const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();

    // Suggested questions based on language
    const suggestedQuestions = language === 'vi' ? [
        'Sản phẩm nào tốt cho tiêu hóa?',
        'Nước khóm lên men giá bao nhiêu?',
        'Cách sử dụng phân vi sinh?',
        'Trang web có những gì?',

    ] : [
        'Which product is good for digestion?',
        'How much is fermented khom drink?',
        'How to use bio-fertilizer?',
        'What does the website offer?',

    ];

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text?: string) => {
        const messageText = text || inputValue.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Call API
            const response = await ChatService.sendMessage(messageText);

            // Add assistant message
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.reply,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Add error message
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: t('chat.error') || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.chatContainer}>
            {/* Chat Button */}
            <button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                title={t('chat.title') || 'Chat với ORCHA'}
            >
                <ChatIcon />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.headerInfo}>
                            <h3 className={styles.chatTitle}>
                                {t('chat.title') || 'Chat với ORCHA'}
                            </h3>
                            <span className={styles.chatStatus}>
                                <span className={styles.statusDot}></span>
                                {language === 'vi' ? 'Trực tuyến' : 'Online'}
                            </span>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.messagesContainer}>
                        {messages.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>
                                    <SparkleIcon />
                                </div>
                                <p className={styles.emptyStateText}>
                                    {t('chat.welcome') || 'Xin chào! Có điều gì tôi có thể giúp bạn?'}
                                </p>
                                <div className={styles.suggestedQuestions}>
                                    <p className={styles.suggestedTitle}>
                                        {language === 'vi' ? 'Câu hỏi gợi ý:' : 'Suggested questions:'}
                                    </p>
                                    {suggestedQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            className={styles.suggestionBtn}
                                            onClick={() => handleSendMessage(question)}
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`${styles.messageGroup} ${
                                            message.role === 'user'
                                                ? styles.userMessage
                                                : styles.assistantMessage
                                        }`}
                                    >
                                        <div
                                            className={`${styles.messageBubble} ${
                                                message.role === 'user'
                                                    ? styles.userBubble
                                                    : styles.assistantBubble
                                            }`}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div dangerouslySetInnerHTML={{ 
                                                    __html: message.content
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                        .split('\n')
                                                        .join('<br />')
                                                }} />
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                        <span className={styles.messageTime}>
                                            {formatTime(message.timestamp)}
                                        </span>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div
                                        className={`${styles.messageGroup} ${styles.assistantMessage}`}
                                    >
                                        <div className={styles.assistantBubble}>
                                            <span className={styles.loadingSpinner} />
                                            {t('chat.thinking') || 'Đang suy nghĩ...'}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder={t('chat.placeholder') || 'Nhập tin nhắn...'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    handleSendMessage();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={() => handleSendMessage()}
                            disabled={isLoading || !inputValue.trim()}
                            title={t('chat.send') || 'Gửi'}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
