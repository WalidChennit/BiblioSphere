import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Book, BookOpen, Users, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">BiblioSphere</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 text-balance">
          Your Digital Library Awaits
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 text-balance">
          Access thousands of books, articles, and educational resources in one place. Build your knowledge, explore new
          worlds, and grow with us.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16 text-balance">
            Why Choose BiblioSphere?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-amber-50 dark:bg-slate-800">
              <CardHeader>
                <Book className="w-12 h-12 text-amber-600 dark:text-amber-500 mb-4" />
                <CardTitle>Vast Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Access millions of books across all genres and languages
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-orange-50 dark:bg-slate-800">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-orange-600 dark:text-orange-500 mb-4" />
                <CardTitle>Easy Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">Read anywhere, anytime on any device</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-amber-50 dark:bg-slate-800">
              <CardHeader>
                <Users className="w-12 h-12 text-amber-600 dark:text-amber-500 mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect with readers and share your thoughts
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-orange-50 dark:bg-slate-800">
              <CardHeader>
                <Shield className="w-12 h-12 text-orange-600 dark:text-orange-500 mb-4" />
                <CardTitle>Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your data and reading history are protected
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Ready to Start Reading?</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          Join thousands of readers who are discovering their next favorite book.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 px-6 text-center">
        <p>&copy; 2025 BiblioSphere. All rights reserved.</p>
      </footer>
    </div>
  )
}
