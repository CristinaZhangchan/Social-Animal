"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Mail, Lock, User, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook, BsGithub } from 'react-icons/bs';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supabaseConfigured, setSupabaseConfigured] = useState(true);

    const router = useRouter();
    const { user, loading, signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithGithub } = useAuth();

    useEffect(() => {
        setSupabaseConfigured(!!isSupabaseConfigured());
    }, []);

    useEffect(() => {
        if (!loading && user) {
            router.push('/boost');
        }
    }, [user, loading, router]);

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
                router.push('/boost');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
        setError(null);
        setIsSubmitting(true);

        try {
            let result;
            switch (provider) {
                case 'google':
                    result = await signInWithGoogle();
                    break;
                case 'facebook':
                    result = await signInWithFacebook();
                    break;
                case 'github':
                    result = await signInWithGithub();
                    break;
            }

            if (result.error) {
                setError(result.error.message);
                setIsSubmitting(false);
            }
            // OAuth will redirect, no need to handle success here
        } catch (err) {
            setError('Authentication failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'radial-gradient(circle, hsl(262 83% 58%) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[100px] opacity-15"
                    style={{ background: 'radial-gradient(circle, hsl(15 85% 60%) 0%, transparent 70%)' }}
                />
            </div>

            {/* Header */}
            <nav className="relative z-10 container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        Social Animal
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Auth Card */}
            <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl">
                    {/* Configuration Warning */}
                    {!supabaseConfigured && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                        Supabase Not Configured
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-300 text-xs">
                                        Social login is not yet set up. Please configure Supabase environment variables in <code className="bg-amber-500/20 px-1 rounded">.env.local</code>.
                                        See the setup guide for instructions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            {isLogin ? 'Welcome back' : 'Create Account'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isLogin
                                ? 'Sign in to continue your practice'
                                : 'Join SocialAnimal and master every conversation'}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-6 rounded-full"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isSubmitting || !supabaseConfigured}
                        >
                            <FcGoogle className="h-5 w-5 mr-3" />
                            Continue with Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-6 rounded-full"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isSubmitting || !supabaseConfigured}
                        >
                            <BsFacebook className="h-5 w-5 mr-3 text-[#1877F2]" />
                            Continue with Facebook
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-6 rounded-full"
                            onClick={() => handleSocialLogin('github')}
                            disabled={isSubmitting || !supabaseConfigured}
                        >
                            <BsGithub className="h-5 w-5 mr-3" />
                            Continue with GitHub
                        </Button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="displayName"
                                        type="text"
                                        placeholder="Your name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="pl-10 bg-background/50 border-border focus:border-primary"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background/50 border-border focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-background/50 border-border focus:border-primary"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-full"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                }}
                                className="ml-2 text-primary hover:underline font-semibold"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
