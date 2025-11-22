import React from "react";
import type { CoachMessage } from "@/lib/types";

interface ConversationProps {
  messages: CoachMessage[];
}

export default function Conversation({ messages }: ConversationProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 h-full flex items-center justify-center text-sm text-slate-400">
        Ask a question about your current game and your Challenger coach will answer here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 max-h-[480px] overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.from === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.from === "user"
                ? "bg-indigo-600 text-white rounded-br-none"
                : "bg-slate-800 text-slate-100 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
