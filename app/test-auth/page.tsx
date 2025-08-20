import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TestAuthPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Authentication Working!</h2>
                    <div className="space-y-2 text-green-700">
                        <p><strong>User ID:</strong> {session.user.id}</p>
                        <p><strong>Email:</strong> {session.user.email}</p>
                        <p><strong>Name:</strong> {session.user.name}</p>
                        <p><strong>Role:</strong> {session.user.role}</p>
                        <p><strong>Status:</strong> {session.user.status}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        href="/api/auth/signout"
                        className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 ml-4"
                    >
                        Sign Out
                    </Link>
                </div>
            </div>
        </div>
    )
}