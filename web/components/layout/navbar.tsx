"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Menu, X, User, MessageSquare, LogOut, Map, CreditCard, ArrowLeft } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link href="/" className="text-foreground/70 hover:text-primary transition-colors font-medium">
        Discover
      </Link>
      <Link href="/map" className="text-foreground/70 hover:text-primary transition-colors font-medium">
        Map View
      </Link>
    </>
  )

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="AV Marketplace" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">AV Marketplace</span>
            <span className="text-lg font-bold text-primary sm:hidden">AVM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Search Toggle - Mobile Only */}
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)} className="lg:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to AV Marketplace
                  </Link>
                  <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                  <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border mb-1">
                    Fayda ID: {user.faydaId}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/map" className="flex items-center lg:hidden">
                      <Map className="mr-2 h-4 w-4" />
                      Map View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild className="hidden sm:flex">
                  <Link href="/login">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Continue with Fayda
                  </Link>
                </Button>
                <Button asChild size="sm" className="sm:hidden">
                  <Link href="/login">
                    <CreditCard className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="space-y-4">
                    <NavLinks />
                  </div>
                  {!user && (
                    <div className="pt-4 border-t border-border">
                      <Button asChild className="w-full">
                        <Link href="/login">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Continue with Fayda
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search ads and businesses..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
