"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"
import { userApi } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User as UserIcon, Mail, Phone, Calendar, Users } from "lucide-react"
import type { User } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth")
    } else {
      setIsCheckingAuth(false)
      loadProfile()
    }
  }, [router])

  const loadProfile = async () => {
    try {
      const profile = await userApi.getMe()
      setUser(profile)
    } catch (error) {
      console.error("[Profile] Failed to load profile:", error)
      // If failed to load profile, user might not be authenticated
      // Redirect to auth page
      router.push("/auth")
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Your profile information is synced from Fayda eSignet (national identity system)
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    This information is verified by Fayda eSignet and cannot be edited manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="text-lg font-medium">{user?.full_name || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-lg font-medium">{user?.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="text-lg font-medium">{user?.phone_number || "Not provided"}</p>
                    </div>
                  </div>

                  {user?.birthdate && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="text-lg font-medium">
                          {new Date(user.birthdate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {user?.gender && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="text-lg font-medium">{user.gender}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your AdVouch account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="text-lg font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Profile Visibility</p>
                    <p className="text-lg font-medium">{user?.public ? "Public" : "Private"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Information Notice */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Your personal information is verified and maintained by Fayda eSignet,
                    Ethiopia's national identity authentication system. This ensures the accuracy and security of your
                    data. If you need to update your information, please contact Fayda eSignet directly.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

