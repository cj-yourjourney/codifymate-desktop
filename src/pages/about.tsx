import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          About This App
        </h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Technology Stack</h2>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <span className="badge badge-primary w-2 h-2 p-0"></span>
                <span>Next.js with Pages Router</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-success w-2 h-2 p-0"></span>
                <span>TypeScript</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-secondary w-2 h-2 p-0"></span>
                <span>Electron</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-info w-2 h-2 p-0"></span>
                <span>TailwindCSS</span>
              </li>
            </ul>

            <div className="flex gap-4">
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
              <Link href="/settings" className="btn btn-success">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
