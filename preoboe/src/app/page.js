import Image from "next/image";
import Tuner from "../components/Audio/Tuner";
import Metronome from "../components/Audio/Metronome";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-12">
      <main className="w-full max-w-5xl px-6">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={48} height={20} priority />
            <h1 className="text-2xl font-semibold">PreOboe — Herramientas de práctica</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
          <Metronome />
        </div>
      </main>
    </div>
  );
}
