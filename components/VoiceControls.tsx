import React from "react";

interface VoiceControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export default function VoiceControls({
  isRecording,
  onToggleRecording
}: VoiceControlsProps) {
  return (
    <button
      type="button"
      onClick={onToggleRecording}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border ${
        isRecording
          ? "border-red-500/70 bg-red-500/10 text-red-200"
          : "border-slate-600 bg-slate-800/60 hover:bg-slate-700"
      }`}
    >
      <span className="text-lg">{isRecording ? "🎙️" : "🎤"}</span>
      {isRecording ? "Listening..." : "Press to speak"}
    </button>
  );
}
