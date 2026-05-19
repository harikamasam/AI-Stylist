import { Mic, Radio } from "lucide-react";

function VoiceAssistant({ startVoiceAssistant, listening }) {
  return (
    <button
      type="button"
      onClick={startVoiceAssistant}
      aria-label={listening ? "Voice assistant listening" : "Start voice assistant"}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300 text-black shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
    >
      {listening ? <Radio size={26} /> : <Mic size={26} />}
    </button>
  );
}

export default VoiceAssistant;
