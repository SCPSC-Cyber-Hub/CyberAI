import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateChatResponse(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    // Convert conversation history to Gemini format
    const contents = [
      ...conversationHistory.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are Cyber AI, an advanced AI assistant with a cyber-themed personality. 
        You are knowledgeable, helpful, and provide detailed responses. 
        You can assist with coding, creative tasks, analysis, and general questions.
        Maintain a professional yet engaging tone that matches your cyber AI theme.`,
      },
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        throw new Error("Invalid or missing API key. Please check your Gemini API configuration.");
      }
      if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
      if (error.message.includes("rate")) {
        throw new Error("Rate limit exceeded. Please wait a moment before sending another message.");
      }
    }
    
    throw new Error("Failed to generate AI response. Please try again.");
  }
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ 
            text: `Generate a short, descriptive title (max 50 characters) for a conversation that starts with: "${firstMessage.substring(0, 200)}"`
          }]
        }
      ],
    });

    const title = response.text?.substring(0, 50) || "New Conversation";
    return title.replace(/['"]/g, "").trim();
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return "New Conversation";
  }
}
