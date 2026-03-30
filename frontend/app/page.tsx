import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 w-full bg-background min-h-screen selection:bg-primary-500/30">
      <header className="absolute top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500/10 p-2 rounded-xl border border-primary-500/20">
            <MessageSquarePlus className="w-6 h-6 text-primary-400" />
          </div>
          <span className="font-semibold text-lg tracking-tight">FeedPulse</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
          Admin Login
        </Link>
      </header>

      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 lg:p-24 overflow-hidden pt-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-400/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="z-10 w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-6 text-center md:text-left">
            <BadgeWrapper>Help Us Improve</BadgeWrapper>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-slate-400">
              We&apos;re listening to your feedback.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto md:mx-0">
              Encountered a bug? Want a new feature? Tell us about your experience so we can make our product better for everyone.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface-800/60 backdrop-blur-2xl p-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Submit Feedback
              </h2>
              <FeedbackForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BadgeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-400 mb-2 w-fit mx-auto md:mx-0 backdrop-blur-sm">
      <span className="flex h-2 w-2 rounded-full bg-primary-500 mr-2 shadow-[0_0_8px_rgba(139,92,246,0.6)] animate-pulse" />
      {children}
    </div>
  );
}
