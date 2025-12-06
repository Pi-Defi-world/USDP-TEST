"use client"

import { Button } from "@/components/ui/button"
import { Home, TrendingUp, User, LogOut, Wallet, Coins, ArrowDownCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePi } from "@/components/providers/pi-provider"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mobile Bottom Navigation Component
function MobileBottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Scroll-based show/hide behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < lastScrollY || currentScrollY < 100 || currentScrollY > document.body.scrollHeight - window.innerHeight - 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/mint", icon: Coins, label: "Mint" },
    { href: "/stats", icon: TrendingUp, label: "Stats" },
    { href: "/redeem", icon: ArrowDownCircle, label: "Redeem" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
      // Safe area insets require inline styles for proper mobile support
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
        paddingLeft: 'env(safe-area-inset-left, 1rem)',
        paddingRight: 'env(safe-area-inset-right, 1rem)'
      }}
    >
      <div className="relative max-w-sm mx-auto">
        <div className="bg-[#000000]/95 backdrop-blur-md border border-[#1C1F25] rounded-t-2xl shadow-2xl px-3 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname && item.href !== "/" && pathname?.startsWith(item.href))
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "flex flex-col items-center justify-center transition-all p-2 rounded-lg min-w-[60px]",
                    isActive 
                      ? 'text-gradient-blue bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
                  <span className={cn("text-[10px] mt-1 font-medium", isActive && "text-gradient-blue")}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const { user, isAuthenticated, authenticate, signOut } = usePi()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePiAuth = async () => {
    if (typeof window === 'undefined') {
      alert('Window not available. Please refresh the page.')
      return
    }

    if (!window.Pi) {
      alert('Pi SDK not available. Please open this app in Pi Browser.')
      return
    }

    setAuthLoading(true)
    try {
      await authenticate()
    } catch (error) {
      console.error('Pi authentication failed:', error)
      alert(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/mint", label: "Mint" },
    { href: "/stats", label: "Stats" },
    { href: "/redeem", label: "Redeem" },
    { href: "/profile", label: "Profile" },
  ]

  // User Menu / Auth Button Component (reusable)
  const UserMenuButton = () => (
    <div className="flex items-center gap-3">
      {!mounted ? (
        <Button variant="outline" className="gap-2 bg-transparent" disabled>
          <Wallet className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Loading...</span>
        </Button>
      ) : isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <User className="h-4 w-4" />
              <span className="text-sm max-w-[120px] truncate hidden sm:inline">
                {user?.username || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                <Wallet className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={handlePiAuth} 
          disabled={authLoading}
          size="sm" 
          className="gap-2 bg-gradient-blue hover:opacity-90 text-white"
        >
          <Wallet className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">
            {authLoading ? 'Connecting...' : 'Connect Pi'}
          </span>
        </Button>
      )}
    </div>
  )

  // Logo Component (reusable)
  const Logo = () => (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <Image 
          src="/usdp-logo.png" 
          alt="USDP Logo" 
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      <span className="font-bold text-xl text-gradient-blue">USDP</span>
    </Link>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-[#1C1F25] bg-[#000000]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />
          <UserMenuButton />
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden lg:block fixed top-0 w-full z-50 border-b border-[#1C1F25] bg-[#000000]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname && item.href !== "/" && pathname?.startsWith(item.href))
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                    isActive 
                      ? "text-gradient-blue bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* User Menu / Auth Button */}
          <UserMenuButton />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  )
}
