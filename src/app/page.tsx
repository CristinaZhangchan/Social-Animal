"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, MessageSquare, Target, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";

const Index = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Bold gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(262 83% 58%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(15 85% 60%) 0%, transparent 70%)' }}
        />
      </div>

      {/* Navigation */}
      <Header />

      {/* Hero Section - Bold & Human */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Real user faces as social proof */}
          <div className="flex items-center justify-center gap-1 mb-8">
            <div className="flex -space-x-3">
              {['anna.jpg', 'eric.jpg', 'kristin.jpg', 'josh.jpg', 'susan.jpg'].map((img, i) => (
                <img
                  key={i}
                  src={`/avatars/${img}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <span className="ml-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,000+</span> people practicing
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Get better at
            <br />
            <span className="text-gradient">talking to people</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Practice real conversations with AI. Build social skills and confidence for the moments that matter.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => router.push("/demo")}
              className="bg-foreground text-background hover:bg-foreground/90 text-lg font-bold px-8 py-7 rounded-full shadow-lg hover:shadow-xl transition-all group"
            >
              Try it free
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free to start • No credit card needed
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">How it works</h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">1. Create a scenario</p>
                  <p className="text-muted-foreground">Describe any conversation you want to practice—salary talks, tough discussions, or anything else.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">2. Practice with AI</p>
                  <p className="text-muted-foreground">Have a realistic conversation with our AI that responds like a real person would.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">3. Get better</p>
                  <p className="text-muted-foreground">Receive instant feedback and track your progress over time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Quick & Visual */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Practice conversations you find hard
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Our AI plays the other person so you can practice.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: "💼", title: "Salary talks", desc: "Ask for what you deserve" },
              { emoji: "💔", title: "Tough breakups", desc: "End things with grace" },
              { emoji: "👨‍👩‍👧", title: "Family stuff", desc: "Set boundaries that stick" },
              { emoji: "🎤", title: "Job interviews", desc: "Nail the hard questions" },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push("/demo")}
              >
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof with Real Faces */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "I practiced my resignation conversation 3 times before the real thing. Walked in calm, walked out with a great reference.",
                name: "Sarah Chen",
                role: "Marketing Director",
                img: "kristin.jpg"
              },
              {
                quote: "Finally told my parents I'm not going to med school. SocialAnimal helped me find the words and the courage.",
                name: "James Okonkwo",
                role: "Design Student",
                img: "josh.jpg"
              }
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-card border border-border/50"
              >
                <p className="text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={`/avatars/${testimonial.img}`}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Bold & Simple */}
      <section className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Start in 30 seconds</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Communication is a skill.
            <br />
            <span className="text-gradient">Practice makes better.</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Start improving how you communicate today.
          </p>

          <Button
            size="lg"
            onClick={() => router.push("/demo")}
            className="bg-foreground text-background hover:bg-foreground/90 font-bold text-lg px-12 py-7 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Start Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative z-10 container mx-auto px-4 py-12 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="text-xl font-bold text-primary">
            Social Animal
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2024 SocialAnimal. Made for humans who want to communicate better.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Index;
