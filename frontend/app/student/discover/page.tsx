"use client"

import { useState } from "react"
import { Search, Filter, X, Heart, BookMarked, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock book data
const mockBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    language: "English",
    isbn: "978-0385547925",
    publisher: "Penguin",
    year: 2020,
    rating: 4.5,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%23CA8A04%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3EThe Midnight Library%3C/text%3E%3C/svg%3E')",
    description:
      "A dazzling novel from the author of Reasons to Stay Alive explores all the choices that go into a life well lived.",
    available: true,
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    language: "English",
    isbn: "978-0735211292",
    publisher: "Avery",
    year: 2018,
    rating: 4.7,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%23EA580C%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3EAtomic Habits%3C/text%3E%3C/svg%3E')",
    description:
      "Tiny Changes, Remarkable Results. No matter your goals, Atomic Habits offers a proven framework for improving.",
    available: true,
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    language: "English",
    isbn: "978-0553380163",
    publisher: "Bantam",
    year: 1988,
    rating: 4.3,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%233B82F6%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3EA Brief History of Time%3C/text%3E%3C/svg%3E')",
    description: "Stephen Hawking explores the universe, from the Big Bang to Black Holes and everything in between.",
    available: true,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    language: "English",
    isbn: "978-0062316097",
    publisher: "Harper",
    year: 2011,
    rating: 4.6,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%238B5A2B%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3ESapiens%3C/text%3E%3C/svg%3E')",
    description: "From the Stone Age to Modern Times, explore the history of humankind and how we changed the world.",
    available: false,
  },
  {
    id: 5,
    title: "Educated",
    author: "Tara Westover",
    category: "Biography",
    language: "English",
    isbn: "978-0399590504",
    publisher: "Random House",
    year: 2018,
    rating: 4.5,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%2310B981%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3EEducated%3C/text%3E%3C/svg%3E')",
    description:
      "A memoir about a young woman who leaves her survivalist family and gets an education at Cambridge University.",
    available: true,
  },
  {
    id: 6,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    language: "English",
    isbn: "978-0743273565",
    publisher: "Scribner",
    year: 1925,
    rating: 4.2,
    cover:
      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22200%22%3E%3Crect fill=%22%23F59E0B%22 width=%22150%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominantBaseline=%22middle%22 textAnchor=%22middle%22 fontFamily=%22serif%22 fontSize=%2216%22 fill=%22white%22%3EThe Great Gatsby%3C/text%3E%3C/svg%3E')",
    description:
      "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    available: true,
  },
]

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [language, setLanguage] = useState("all")
  const [author, setAuthor] = useState("all")
  const [isbn, setIsbn] = useState("") // Add ISBN filter state
  const [selectedBook, setSelectedBook] = useState<(typeof mockBooks)[0] | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)

    const matchesCategory = category === "all" || book.category === category
    const matchesLanguage = language === "all" || book.language === language
    const matchesAuthor = author === "all" || book.author === author
    const matchesIsbn = isbn === "" || book.isbn.includes(isbn)

    return matchesSearch && matchesCategory && matchesLanguage && matchesAuthor && matchesIsbn
  })

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Fiction">Fiction</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Self-Help">Self-Help</SelectItem>
              <SelectItem value="Biography">Biography</SelectItem>
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="German">German</SelectItem>
            </SelectContent>
          </Select>

          <Select value={author} onValueChange={setAuthor}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {Array.from(new Set(mockBooks.map((b) => b.author))).map((auth) => (
                <SelectItem key={auth} value={auth}>
                  {auth}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by ISBN..."
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
          </div>

          {(searchQuery !== "" || category !== "all" || language !== "all" || author !== "all" || isbn !== "") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setCategory("all")
                setLanguage("all")
                setAuthor("all")
                setIsbn("")
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
      </div>

      {/* Books Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="group cursor-pointer">
            <div
              className="relative mb-4 rounded-lg overflow-hidden aspect-[3/4] bg-slate-200 dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBook(book)}
            >
              {/* Book Cover */}
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative">
                <span className="text-white text-center px-4 font-serif text-sm font-bold">{book.title}</span>
                {!book.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedBook(book)
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(book.id)
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(book.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Book Info */}
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{book.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{book.author}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {book.category}
              </Badge>
              <span className="text-xs text-amber-600 dark:text-amber-500">★ {book.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBook(null)}
        >
          <Card
            className="w-full max-w-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <button
                onClick={() => setSelectedBook(null)}
                className="float-right p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-3 gap-6 mt-4">
                {/* Book Cover */}
                <div className="h-72 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-center px-4 font-serif font-bold text-lg">{selectedBook.title}</span>
                </div>

                {/* Book Info */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBook.title}</h2>
                    <p className="text-lg text-amber-600 dark:text-amber-500">{selectedBook.author}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">ISBN:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{selectedBook.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Publisher:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.publisher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Published:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Language:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Category:</span>
                      <Badge>{selectedBook.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Rating:</span>
                      <span className="text-amber-600 dark:text-amber-500 font-semibold">★ {selectedBook.rating}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBook.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled={!selectedBook.available}>
                      <BookMarked className="w-4 h-4 mr-2" />
                      {selectedBook.available ? "Borrow This Book" : "Out of Stock"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => toggleFavorite(selectedBook.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedBook.id) ? "fill-current" : ""}`} />
                      {favorites.includes(selectedBook.id) ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
