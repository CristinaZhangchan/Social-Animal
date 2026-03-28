"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Gift, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildTransitionHref, pushWithTransition } from "@/lib/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Header } from "@/components/Header";

export default function PricingPage() {
    const router = useRouter();

    const features = {
        free: [
            { text: "5 sessions (lifetime)", included: true },
            { text: "Custom AI roleplays", included: true },
            { text: "Feedback after each session", included: true },
            { text: "Progress tracking & analytics", included: false },
            { text: "Session history & transcripts", included: false },
        ],
        pro: [
            { text: "30 conversations per month", included: true },
            { text: "Custom AI roleplays", included: true },
            { text: "Detailed feedback & coaching tips", included: true },
            { text: "Progress tracking & skill analytics", included: true },
            { text: "Session history & transcripts", included: true },
            { text: "Streaks, XP & weekly goals", included: true },
        ],
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
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

            {/* Navigation */}
            <Header />

            {/* Header */}
            <section className="relative z-10 container mx-auto px-4 pt-12 pb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Simple pricing
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                    Start free. Upgrade when you're ready. Cancel anytime.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="relative z-10 container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Free Tier */}
                    <Card className="relative border-border/50 bg-card/80 backdrop-blur-sm rounded-3xl">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <Gift className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-2xl">Free</CardTitle>
                            <CardDescription>Try it out, no commitment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <span className="text-5xl font-bold">$0</span>
                            </div>
                            <ul className="space-y-3">
                                {features.free.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        ) : (
                                            <X className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                                        )}
                                        <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full rounded-full py-6"
                                onClick={() => pushWithTransition(router, "/demo")}
                            >
                                Start Free
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Tier */}
                    <Card className="relative border-primary shadow-lg shadow-primary/10 bg-card/80 backdrop-blur-sm rounded-3xl">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Pro</CardTitle>
                            <CardDescription>For consistent improvement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <span className="text-5xl font-bold">$12.99</span>
                                <span className="text-muted-foreground ml-2">/month</span>
                                <p className="text-sm text-muted-foreground mt-1">or $119/year (save 24%)</p>
                            </div>
                            <ul className="space-y-3">
                                {features.pro.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-foreground">
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full rounded-full py-6 bg-primary hover:bg-primary/90"
                                onClick={() => {
                                    // TODO: 这里添加支付链接
                                    alert("付费功能待集成，请参考下面的说明");
                                }}
                            >
                                Get Pro
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            {/* FAQ */}
            <section className="relative z-10 container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-8">Common questions</h2>
                    <div className="space-y-6 text-left">
                        {[
                            {
                                q: "Can I cancel anytime?",
                                a: "Yes. No contracts, no commitments. Cancel whenever you want."
                            },
                            {
                                q: "What happens when my free sessions run out?",
                                a: "Once you've used your 5 free sessions, you'll need to upgrade to Pro to continue practicing."
                            },
                            {
                                q: "Do you offer refunds?",
                                a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied."
                            },
                            {
                                q: "Is my data private?",
                                a: "Yes, we take your privacy seriously. Your session data is securely stored and protected."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 container mx-auto px-4 py-12 border-t border-border/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href={buildTransitionHref("/")} className="text-xl font-bold text-primary">
                        Social Animal
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        © 2024 SocialAnimal. Made for humans who want to communicate better.
                    </p>
                </div>
            </footer>
        </div>
    );
}
