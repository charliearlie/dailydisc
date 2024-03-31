import { Link } from "@remix-run/react"
import { Music } from "lucide-react"

export const Header = () => {
    return (
        <header className="flex items-center h-[60px] px-4 border-b border-gray-100 dark:border-gray-800 bg-primary">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2 text-xl font-semibold text-white" to="#">
            <Music className="w-8 h-8" />
            DailyDisc
          </Link>
        </div>
        <nav className="ml-auto space-x-4 flex items-center">
          <Link
            className="text-sm font-medium text-white transition-colors"
            to="#"
          >
            Archive
          </Link>
          <Link
            className="text-sm font-medium text-white transition-colors"
            to="#"
          >
            About
          </Link>
        </nav>
      </header>
    )
}