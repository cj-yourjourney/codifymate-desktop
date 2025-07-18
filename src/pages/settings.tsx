import Link from 'next/link'

export default function Settings() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Settings
        </h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Application Settings</h2>

            <div className="form-control w-full space-y-4 mb-6">
              <label className="label cursor-pointer justify-between">
                <span className="label-text">Dark Mode</span>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="label cursor-pointer justify-between">
                <span className="label-text">Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="label cursor-pointer justify-between">
                <span className="label-text">Auto Update</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
              <Link href="/about" className="btn btn-success">
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
