// components/layout/toolbar/AIAssistantPanel.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCanvas } from "@/contexts/CanvasContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAssistantPanel = () => {
  const { canvas } = useCanvas();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Later: send canvas + message to your AI backend
      // const res = await fetch("/api/ai/canvas-chat", { ... });
      // const data = await res.json();
      // const reply = data.reply ?? "AI suggestion...";
      const reply =
        "Here’s a suggestion: try adding a bold title at the top and use a contrasting accent color for your call-to-action button.";

      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong while generating suggestions. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="text-xs text-gray-500">
        Ask for layout, color, or content suggestions. The AI will respond based
        on your current canvas and project context.
      </div>

      <div className="flex-1 border rounded-md p-2 bg-gray-50 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-gray-400">
            Example: “Make this poster more minimalist” or “Suggest a better
            hero layout.”
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`text-xs rounded-md px-2 py-1 ${
              m.role === "user"
                ? "bg-indigo-100 text-indigo-900 self-end"
                : "bg-white text-gray-800 border"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you want the AI to improve or generate..."
          className="text-xs"
        />
        <Button
          size="sm"
          className="w-full"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </Button>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
