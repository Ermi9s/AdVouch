"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, X, Megaphone, Building2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface SearchFiltersProps {
  searchType: "ads" | "businesses"
  onSearchTypeChange: (type: "ads" | "businesses") => void
  onSearch: (query: string) => void
  onCategoryFilter: (category: string) => void
  onLocationFilter: (location: string) => void
  onClearFilters: () => void
}

const categories = [
  "All Categories",
  "Home Services",
  "Automotive",
  "Health & Wellness",
  "Education",
  "Technology",
  "Food & Dining",
  "Beauty & Personal Care",
  "Professional Services",
  "Entertainment",
]

const locations = [
  "All Locations",
  "Addis Ababa, Ethiopia",
  "Dire Dawa, Ethiopia",
  "Mekelle, Ethiopia",
  "Gondar, Ethiopia",
  "Hawassa, Ethiopia",
  "Bahir Dar, Ethiopia",
  "Dessie, Ethiopia",
  "Jimma, Ethiopia",
  "Jijiga, Ethiopia",
]

export function SearchFilters({
  searchType,
  onSearchTypeChange,
  onSearch,
  onCategoryFilter,
  onLocationFilter,
  onClearFilters,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onCategoryFilter(category === "All Categories" ? "" : category)
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    onLocationFilter(location === "All Locations" ? "" : location)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setSelectedLocation("All Locations")
    onClearFilters()
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "All Categories" || selectedLocation !== "All Locations"

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Type Toggle */}
        <div className="mb-4">
          <Tabs value={searchType} onValueChange={(value) => onSearchTypeChange(value as "ads" | "businesses")}>
            <TabsList className="grid w-full max-w-sm sm:max-w-md grid-cols-2">
              <TabsTrigger value="ads" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Browse Ads</span>
              </TabsTrigger>
              <TabsTrigger value="businesses" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Find Businesses</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder={searchType === "ads" ? "Search ads..." : "Search businesses..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40 lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-40 lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="px-4 lg:px-6">
              Search
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="px-3 lg:px-4 bg-transparent">
                <X className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Clear</span>
              </Button>
            )}
          </form>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={searchType === "ads" ? "Search ads..." : "Search businesses..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select value={selectedLocation} onValueChange={handleLocationChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters} className="w-full bg-transparent">
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
