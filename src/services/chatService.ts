const DEEPSEEK_API_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    reply: string;
}

export class ChatService {
    static async sendMessage(message: string): Promise<ChatResponse> {
        try {
            if (!DEEPSEEK_API_KEY) {
                throw new Error("DeepSeek API key is not configured. Please set VITE_DEEPSEEK_API_KEY in your environment.");
            }

            const response = await fetch(DEEPSEEK_API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "user",
                            content: message,
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`DeepSeek API Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "No response from DeepSeek";
            
            return {
                reply: reply,
            };
        } catch (error) {
            console.error("Chat service error:", error);
            throw error;
        }
    }
}
