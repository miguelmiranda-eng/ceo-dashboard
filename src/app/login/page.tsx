"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Hardcoded credentials
    if (email === "admin@test.com" && password === "admin123") {
      // Set dummy cookie
      document.cookie = "ceo_auth=true; path=/; max-age=86400"
      router.push("/dashboard")
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <div className="w-8 h-8 bg-primary rounded-full" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t("signIn")}</CardTitle>
          <CardDescription>
            {t("welcome")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("email")} 
                  className="pl-10 h-12 rounded-xl"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("password")} 
                  className="pl-10 h-12 rounded-xl"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg animate-in fade-in zoom-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <span>{t("invalidCreds")}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 rounded-xl text-md font-semibold hover:scale-[1.02] transition-transform duration-200" type="submit">
              {t("login")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
