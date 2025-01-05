import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, LayoutDashboard, FlaskConical } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to <span className="text-blue-600 dark:text-blue-500">LLM Ops</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Get started by exploring our features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link href="/dashboard" className="block">
          <Card className="h-full transition-colors hover:border-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
                <ArrowRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your LLM operations at a glance
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/experiments" className="block">
          <Card className="h-full transition-colors hover:border-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Experiments
                <ArrowRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage and view results of your LLM experiments
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

