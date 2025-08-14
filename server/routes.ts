import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, generateConversationTitle } from "./services/gemini";
import { chatRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = chatRequestSchema.parse(req.body);
      
      // Get conversation history if conversationId provided
      let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
      
      if (conversationId) {
        const messages = await storage.getMessagesByConversation(conversationId);
        conversationHistory = messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
      }

      // Generate AI response
      const aiResponse = await generateChatResponse(message, conversationHistory);

      // Create or get conversation
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const title = await generateConversationTitle(message);
        const conversation = await storage.createConversation({ title });
        currentConversationId = conversation.id;
      }

      // Store user message
      await storage.createMessage({
        conversationId: currentConversationId,
        role: "user",
        content: message
      });

      // Store AI response
      await storage.createMessage({
        conversationId: currentConversationId,
        role: "assistant",
        content: aiResponse
      });

      res.json({
        response: aiResponse,
        conversationId: currentConversationId
      });

    } catch (error) {
      console.error("Chat error:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          error: "An unexpected error occurred while processing your request." 
        });
      }
    }
  });

  // Get conversation history
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch conversation messages" });
    }
  });

  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Cyber AI" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
