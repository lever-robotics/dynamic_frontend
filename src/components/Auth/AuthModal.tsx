import React, { useState } from 'react'
import apolloMaster from '../../utils/apolloMaster'

interface AuthModalProps {
    isOpen: boolean;
    onSuccess: (config: UserConfig) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
    const [email, setEmail] = useState('mark.soulier@usu.edu')
    const [password, setPassword] = useState('password')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const config = await apolloMaster.signIn(email, password)
            onSuccess(config)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
                            Sign in to your account
                        </h3>
                        <div className="mt-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm text-center">{error}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal