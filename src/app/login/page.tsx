"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    // TEMP MOCK LOGIN
    router.push("/admin")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <div
        className="w-full max-w-md rounded-[32px] border p-8"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.45)",
        }}
      >
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <img
            src="/Primary.svg"
            alt="TAP"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* TITLE */}
        <div className="text-center mb-8">
          <p
            className="mb-2"
            style={{
              color: "var(--muted-foreground)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            TAP ADMIN
          </p>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--foreground)",
              fontSize: "44px",
              lineHeight: 1,
              fontWeight: 500,
            }}
          >
            Welcome Back
          </h1>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label
              style={{
                color: "var(--muted-foreground)",
                fontSize: "13px",
              }}
            >
              Email
            </label>

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tap.com"
              className="h-12 rounded-2xl border-0"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="space-y-2">
            <label
              style={{
                color: "var(--muted-foreground)",
                fontSize: "13px",
              }}
            >
              Password
            </label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-2xl border-0"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12 rounded-2xl mt-2"
            style={{
              backgroundColor: "var(--gold)",
              color: "var(--primary-foreground)",
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}