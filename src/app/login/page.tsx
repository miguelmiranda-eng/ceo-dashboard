"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, AlertCircle, ArrowRight, Cpu, BarChart3, TrendingUp } from "lucide-react"

const ProsperLogo = ({ size = 48 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="loginGlobeMask">
        <circle cx="50" cy="50" r="46" fill="white" />
        <path d="M -5,45 C 35,5 75,50 105,25" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
        <path d="M -5,80 C 45,60 65,95 105,65" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
      </mask>
      <linearGradient id="loginLogoBright" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#loginLogoBright)" mask="url(#loginGlobeMask)" />
  </svg>
)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const stats = [
  { icon: Cpu, label: "Active Machines", value: "24/27" },
  { icon: BarChart3, label: "Global Efficiency", value: "87.4%" },
  { icon: TrendingUp, label: "Today's Output", value: "12,480" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    await new Promise(r => setTimeout(r, 600))

    if (email === "admin@test.com" && password === "admin123") {
      document.cookie = "ceo_auth=true; path=/; max-age=86400"
      router.push("/dashboard")
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#020617] font-[family-name:var(--font-geist-sans)]">

      {/* ── Left panel – branding ── */}
      <div className="hidden lg:flex lg:w-[60%] flex-col relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0c1525] to-[#020617]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sky-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-14">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <ProsperLogo size={44} />
            <div className="flex flex-col">
              <span className="font-black text-[15px] leading-tight tracking-tight text-white uppercase">Prosper</span>
              <span className="font-bold text-[9px] leading-none tracking-[0.35em] text-sky-400 uppercase mt-0.5">Manufacturing</span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-sky-400 mb-4 block">
              CEO Executive Dashboard
            </span>
            <h1 className="text-[3.25rem] font-black text-white leading-[1.1] tracking-tight mb-6">
              Real-Time<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500">
                Visibility
              </span>
            </h1>
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-[340px]">
              Plant monitoring, operational efficiency and executive metrics — all in one place.
            </p>

            {/* Live stats */}
            <div className="mt-12 grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-sm"
                >
                  <stat.icon className="h-4 w-4 text-sky-400 mb-3" />
                  <div className="text-xl font-black text-white tabular-nums">{stat.value}</div>
                  <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 mt-1 leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status footer */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] text-slate-500 tracking-[0.25em] uppercase font-semibold">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-[#040d1f]">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <ProsperLogo size={36} />
          <div className="flex flex-col">
            <span className="font-black text-sm leading-tight tracking-tight text-white uppercase">Prosper</span>
            <span className="font-bold text-[8px] leading-none tracking-[0.3em] text-sky-400 uppercase mt-0.5">Manufacturing</span>
          </div>
        </div>

        <div className="w-full max-w-[340px]">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Sign In to Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1.5">Welcome, CEO</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="admin@test.com"
                  className="pl-10 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 transition-all"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 transition-all"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl animate-in fade-in zoom-in duration-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Invalid credentials. Please try again.</span>
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full h-12 rounded-xl font-bold tracking-wide text-sm bg-sky-500 hover:bg-sky-400 text-white border-0 group transition-all duration-200 shadow-[0_0_24px_rgba(14,165,233,0.25)] hover:shadow-[0_0_36px_rgba(14,165,233,0.45)] mt-1"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Log In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">O</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google Login */}
            <Button
              className="w-full h-12 rounded-xl font-bold tracking-wide text-sm bg-white hover:bg-slate-100 text-slate-900 border-0 transition-all duration-200"
              type="button"
              onClick={() => {
                document.cookie = "ceo_auth=true; path=/; max-age=86400"
                router.push("/dashboard")
              }}
            >
              <GoogleIcon />
              Iniciar sesión con Google
            </Button>
          </form>

          <p className="text-center text-[10px] text-slate-600 mt-10 tracking-[0.2em] uppercase font-semibold">
            Restricted Access · Internal Use Only
          </p>
        </div>
      </div>
    </div>
  )
}
