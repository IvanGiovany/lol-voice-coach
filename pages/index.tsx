import React, { useEffect,useRef, useState } from "react";
import NewsRail from "../components/NewsRail";

type GamePhase = "Early" | "Mid" | "Late";
type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

interface CoachMessage {
  id: string;
  from: "user" | "coach";
  text: string;
  createdAt: number;
}

const roles: Role[] = ["Top", "Jungle", "Mid", "ADC", "Support"];
const phases: GamePhase[] = ["Early", "Mid", "Late"];

export default function HomePage() {
  const [champion, setChampion] = useState("");
  const [role, setRole] = useState<Role>("Mid");
  const [phase, setPhase] = useState<GamePhase>("Early");
  const [situation, setSituation] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [yuumiVoice, setYuumiVoice] = useState<SpeechSynthesisVoice | null>(null);


  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Try to pick something that sounds more “cute/female”
      const preferred =
        voices.find((v) =>
          /female|Google UK English Female|Microsoft Zara|Microsoft Sonia/i.test(
            v.name
          )
        ) || voices[0];

      setYuumiVoice(preferred);
    };

    // Some browsers load voices async
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      console.warn("Text-to-speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    // Sprinkle some Yuumi flavour
    const prefixes = [
      "Nyaa~ ",
      "Meow~ ",
      "Hey summoner, ",
      "Hehe, listen up, ",
    ];
    const suffixes = [
      " nya!",
      " meow!",
      " let’s win this.",
      " don’t int, okay?",
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    const utterance = new SpeechSynthesisUtterance(prefix + text + suffix);

    // Make it sound more “cat / magical”
    utterance.rate = 1.15;   // a bit faster
    utterance.pitch = 1.4;   // higher pitch = more cartoony
    utterance.lang = "en-US";

    if (yuumiVoice) {
      utterance.voice = yuumiVoice;
    }

    window.speechSynthesis.speak(utterance);
  }


  async function askCoach() {
    if (!situation.trim() || isLoading) return;

    const userMessage: CoachMessage = {
      id: crypto.randomUUID(),
      from: "user",
      text: situation.trim(),
      createdAt: Date.now()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ champion, role, phase, situation })
      });

      if (!res.ok) {
        throw new Error(`Coach API error: ${res.status}`);
      }

      const data = await res.json();

      const coachMessage: CoachMessage = {
        id: crypto.randomUUID(),
        from: "coach",
        text: data.message ?? "Sorry, I couldn't generate advice just now.",
        createdAt: Date.now()
      };

      setMessages((prev) => [...prev, coachMessage]);
      speak(coachMessage.text);
    } catch (err) {
      console.error(err);
      const errorMessage: CoachMessage = {
        id: crypto.randomUUID(),
        from: "coach",
        text:
          "Hmm, something went wrong talking to the AI coach. Try again in a moment.",
        createdAt: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAskCoach(e: React.FormEvent) {
    e.preventDefault();
    void askCoach();
  }

  function handleToggleRecording() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.warn("Error stopping recognition:", err);
        }
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSituation(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsRecording(false);
    }
  }

  return (
    <>
      {/* Big magical Yuumi panel */}
      <section className="rounded-3xl border border-[#25293a] bg-gradient-to-br from-[#11131b] via-[#0a1016] to-[#05070c] shadow-[0_0_60px_rgba(190,242,100,0.14)] p-5 md:p-7 min-h-[460px]">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 border border-lime-400/40 px-3 py-1 text-[11px] text-lime-200 shadow-[0_0_20px_rgba(190,242,100,0.45)]">
              <span>🧙‍♀️ Yuumi Voice Coach</span>
              <span className="h-1 w-1 rounded-full bg-lime-400" />
              <span>Real-time decisions while you play</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-50">
              Tell Yuumi what&apos;s happening — get a plan for the next 60 seconds.
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Speak or type your situation in lane, teamfights or macro. Yuumi
              translates it into clear, actionable advice you can follow mid–game.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live session</span>
            </div>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="hidden md:inline">
              Best used on a second monitor or overlay.
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1.15fr)] items-stretch">
          {/* LEFT: Prompt / controls */}
          <form
            onSubmit={handleAskCoach}
            className="flex flex-col rounded-2xl bg-[#0b1017] border border-[#222739] shadow-inner shadow-black/40 p-4 md:p-5"
          >
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-[11px] uppercase tracking-wide text-gray-400">
                  Champion
                </label>
                <input
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  placeholder="e.g. Yasuo"
                  className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wide text-gray-400">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wide text-gray-400">
                  Game phase
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as GamePhase)}
                  className="w-full rounded-lg bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40"
                >
                  {phases.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-2 mb-4">
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Situation
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g. I’m 0/2 vs Darius top, wave is pushing to him near his tower, enemy jungler missing, my TP is up."
                rows={5}
                className="flex-1 rounded-xl bg-[#05070c] border border-[#262a3b] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40 resize-none"
              />
              <p className="text-[11px] text-gray-500">
                Hint: describe scoreboard, wave state, vision and cooldowns for
                stronger advice.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium border transition shadow-sm ${
                  isRecording
                    ? "border-pink-500/70 bg-pink-500/10 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.35)]"
                    : "border-[#262a3b] bg-[#111624] text-gray-200 hover:bg-[#151b2a]"
                }`}
              >
                <span className="text-lg">{isRecording ? "🎙️" : "🎤"}</span>
                {isRecording ? "Listening to you…" : "Press to speak"}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full px-6 py-2 text-xs font-semibold bg-lime-400 text-black hover:bg-lime-300 disabled:bg-lime-700/40 disabled:text-gray-300 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(190,242,100,0.45)]"
              >
                {isLoading ? "Yuumi is thinking…" : "Ask Yuumi for a plan"}
              </button>
            </div>
          </form>

          {/* RIGHT: Conversation */}
          <div className="flex flex-col rounded-2xl bg-[#05070c] border border-[#262a3b] shadow-inner shadow-black/40 p-4 md:p-5 min-h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-100">
                Session timeline
              </h3>
              <span className="text-[11px] text-gray-500">
                Yuumi speaks your coach&apos;s answers aloud.
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="flex-1 rounded-xl border border-dashed border-[#262a3b] bg-gradient-to-br from-[#0a0f16] to-[#05060a] flex items-center justify-center text-sm text-gray-500">
                Start by telling Yuumi about a tricky fight, losing lane or macro
                decision. She&apos;ll draw a path for your next few plays.
              </div>
            ) : (
              <div className="flex-1 rounded-xl bg-[#090d14] border border-[#191f2f] p-3 space-y-3 max-h-[420px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        msg.from === "user"
                          ? "bg-lime-400 text-black rounded-br-none shadow-[0_0_22px_rgba(190,242,100,0.55)]"
                          : "bg-[#111624] text-gray-100 border border-[#262a3b] rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blitz-style news rail */}
      <NewsRail />
    </>
  );
}
