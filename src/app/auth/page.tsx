"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pushWithTransition } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook } from 'react-icons/bs';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supabaseConfigured, setSupabaseConfigured] = useState(true);

    const router = useRouter();
    const { user, loading, signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();

    useEffect(() => {
        setSupabaseConfigured(!!isSupabaseConfigured());
    }, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            let result;
            if (isLogin) {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password, displayName);
            }

            if (result.error) {
                setError(result.error.message);
            } else {
                pushWithTransition(router, '/home');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setError(null);
        setIsSubmitting(true);

        try {
            let result;
            if (provider === 'google') {
                result = await signInWithGoogle();
            } else {
                result = await signInWithFacebook();
            }

            if (result.error) {
                setError(result.error.message);
                setIsSubmitting(false);
            }
        } catch {
            setError('Authentication failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#28020d] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5ebe2]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#28020d] flex flex-col">
            {/* Logo area on maroon background */}
            <div className="flex justify-center pt-12 pb-8">
                <Logo collapsed={true} size="lg" color="cream" href={undefined} />
            </div>

            {/* Curved content area */}
            <div
                className="flex-1 relative overflow-hidden rounded-tl-[90px] rounded-tr-[90px] rounded-bl-[30px] rounded-br-[30px] px-6 py-12 md:px-12 lg:px-20 flex flex-col items-center"
                style={{ background: 'linear-gradient(244deg, #F5EBE2 1%, #F8DFC9 99%)' }}
            >
                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 rounded-tl-[90px] rounded-tr-[90px] rounded-bl-[30px] rounded-br-[30px] pointer-events-none opacity-50"
                    style={{
                        mixBlendMode: 'soft-light',
                        backgroundImage: 'url(/noise-texture.png)',
                        backgroundSize: 'cover',
                    }}
                />

                {/* Heading */}
                <h1
                    className="text-center mb-10 text-[#28020d]"
                    style={{ fontSize: '60px', lineHeight: 1.2, letterSpacing: '-2.4px' }}
                >
                    <span style={{ fontFamily: "'Fedro', serif", fontWeight: 600 }}>
                        {isLogin ? 'Welcome Back' : 'Welcome'}
                    </span>
                    <span style={{ fontFamily: "'Libre Baskerville', serif" }}>!</span>
                </h1>

                {/* Supabase warning */}
                {!supabaseConfigured && (
                    <div className="mb-8 max-w-xl w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative z-10">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                                Supabase not configured. Set up environment variables in <code className="bg-amber-500/20 px-1 rounded">.env.local</code>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-6 max-w-xl w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl relative z-10">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Main auth content: form | OR | social */}
                <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-0 relative z-10">

                    {/* Left: Email/Password Form */}
                    <form
                        onSubmit={handleEmailAuth}
                        className="flex-1 flex flex-col gap-5 max-w-md w-full lg:self-center"
                    >
                        {/* Email field */}
                        <div className="flex flex-col gap-2">
                            <label
                                className="text-[#28020d] text-[21px] pl-2"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-[413.75px] max-w-full h-[71.25px] rounded-[75px] border-[1.5px] border-[#fffefe] bg-white/20 backdrop-blur-[30px] px-8 text-[#28020d] placeholder:text-[#c8ad93] outline-none focus:border-white/80 focus:shadow-[0_0_20px_rgba(200,173,147,0.2)] transition-all"
                                style={{ fontFamily: "'Figtree', sans-serif", opacity: 1 }}
                            />
                        </div>

                        {/* Password field */}
                        <div className="flex flex-col gap-2">
                            <label
                                className="text-[#28020d] text-[21px] pl-2"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-[413.75px] max-w-full h-[71.25px] rounded-[75px] border-[1.5px] border-[#fffefe] bg-white/20 backdrop-blur-[30px] px-8 text-[#28020d] placeholder:text-[#c8ad93] outline-none focus:border-white/80 focus:shadow-[0_0_20px_rgba(200,173,147,0.2)] transition-all"
                                style={{ fontFamily: "'Figtree', sans-serif", opacity: 1 }}
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-[212px] h-[70px] bg-[#28020d] rounded-[35px] text-[#f5ebe2] text-[24px] flex items-center justify-center gap-2 mt-2 hover:translate-y-[-2px] hover:shadow-[0_8px_25px_rgba(40,2,13,0.3)] transition-all disabled:opacity-50"
                            style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 500 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {isLogin ? 'Logging in...' : 'Signing up...'}
                                </>
                            ) : (
                                isLogin ? 'Log In' : 'Sign Up'
                            )}
                        </button>
                    </form>

                    {/* Center: OR divider */}
                    <div className="flex lg:flex-col items-center gap-4 lg:mx-10">
                        <div className="w-16 h-[2px] lg:w-[2px] lg:h-full lg:min-h-[200px] bg-[#cfb49e]" />
                        <span
                            className="text-[16px] text-[#333] shrink-0"
                            style={{ fontFamily: "'Figtree', sans-serif" }}
                        >
                            OR
                        </span>
                        <div className="w-16 h-[2px] lg:w-[2px] lg:h-full lg:min-h-[200px] bg-[#cfb49e]" />
                    </div>

                    {/* Right: Social logins */}
                    <div className="flex-1 flex flex-col gap-5 max-w-md w-full justify-center">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isSubmitting || !supabaseConfigured}
                            className="w-[413.75px] max-w-full h-[71.25px] rounded-[75px] border-[1.5px] border-[#fffefe] bg-white/20 backdrop-blur-[30px] px-8 flex items-center gap-4 cursor-pointer hover:border-white/80 transition-all disabled:opacity-50"
                        >
                            <FcGoogle className="h-6 w-6 shrink-0" />
                            <span
                                className="text-[#28020d] text-[21px]"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                Continue with Google
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isSubmitting || !supabaseConfigured}
                            className="w-[413.75px] max-w-full h-[71.25px] rounded-[75px] border-[1.5px] border-[#fffefe] bg-white/20 backdrop-blur-[30px] px-8 flex items-center gap-4 cursor-pointer hover:border-white/80 transition-all disabled:opacity-50"
                        >
                            <BsFacebook className="h-6 w-6 shrink-0 text-[#1877F2]" />
                            <span
                                className="text-[#28020d] text-[21px]"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                Continue with Facebook
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                                emailInput?.focus();
                            }}
                            className="w-[413.75px] max-w-full h-[71.25px] rounded-[75px] border-[1.5px] border-[#fffefe] bg-white/20 backdrop-blur-[30px] px-8 flex items-center gap-4 cursor-pointer hover:border-white/80 transition-all"
                        >
                            <Mail className="h-6 w-6 shrink-0 text-[#c8ad93]" />
                            <span
                                className="text-[#28020d] text-[21px]"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                {isLogin ? 'Log in with email' : 'Sign up with email'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Bottom toggle */}
                <div className="mt-12 text-center relative z-10">
                    <p
                        className="text-[#28020d] text-[21px]"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="underline text-[#28020d] text-[21px]"
                            style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 500 }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
