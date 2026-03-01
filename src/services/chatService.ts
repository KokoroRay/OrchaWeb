const API_ENDPOINT = "https://ady0805oe7.execute-api.ap-southeast-1.amazonaws.com/default/Bucheoh";

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
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Chat service error:", error);
            throw error;
        }
    }
}
