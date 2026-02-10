"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserTier, upgradeToPremium, saveUserTier, getConversationsRemaining } from "@/lib/auth/tier-manager";

export default function DevToolsPage() {
  const [currentTier, setCurrentTier] = useState<any>(null);
  const [conversationsRemaining, setConversationsRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshStatus();
  }, []);

  const refreshStatus = () => {
    const tier = getUserTier();
    setCurrentTier(tier);
    setConversationsRemaining(getConversationsRemaining());
  };

  const handleUpgradeToMonthly = () => {
    upgradeToPremium("monthly");
    refreshStatus();
  };

  const handleUpgradeToAnnual = () => {
    upgradeToPremium("annual");
    refreshStatus();
  };

  const handleResetToFree = () => {
    saveUserTier({
      plan: "free",
      conversationsThisWeek: 0,
      weekStartDate: new Date().toISOString(),
    });
    refreshStatus();
  };

  const handleResetConversations = () => {
    if (currentTier) {
      saveUserTier({
        ...currentTier,
        conversationsThisWeek: 0,
      });
      refreshStatus();
    }
  };

  const handleSetMaxConversations = () => {
    if (currentTier) {
      saveUserTier({
        ...currentTier,
        conversationsThisWeek: 3,
      });
      refreshStatus();
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 border-2 border-yellow-400">
          <h1 className="text-4xl font-bold text-white mb-2">🛠️ Developer Tools</h1>
          <p className="text-white/80">Switch user status to test different features</p>
          <Link href="/" className="text-yellow-300 hover:text-yellow-200 mt-2 inline-block">
            ← Back to Home
          </Link>
        </div>

        {/* Current Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Current Status</h2>
          {currentTier ? (
            <div className="space-y-3">
              <div className="bg-white/20 rounded-xl p-4">
                <span className="text-white/70">Tier:</span>
                <span className="text-white font-bold ml-2">
                  {currentTier.plan === "free" && "🆓 Free"}
                  {currentTier.plan === "monthly" && "💎 Monthly Premium"}
                  {currentTier.plan === "annual" && "👑 Annual Premium"}
                </span>
              </div>

              <div className="bg-white/20 rounded-xl p-4">
                <span className="text-white/70">Conversations This Week:</span>
                <span className="text-white font-bold ml-2">
                  {currentTier.conversationsThisWeek}/
                  {currentTier.plan === "free" ? "3" : "∞"}
                </span>
              </div>

              <div className="bg-white/20 rounded-xl p-4">
                <span className="text-white/70">Remaining:</span>
                <span className="text-white font-bold ml-2">
                  {conversationsRemaining === Infinity ? "Unlimited" : conversationsRemaining}
                </span>
              </div>

              {currentTier.subscriptionExpiry && (
                <div className="bg-white/20 rounded-xl p-4">
                  <span className="text-white/70">Expires:</span>
                  <span className="text-white font-bold ml-2">
                    {new Date(currentTier.subscriptionExpiry).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="bg-white/20 rounded-xl p-4">
                <span className="text-white/70">Week Start:</span>
                <span className="text-white font-bold ml-2">
                  {new Date(currentTier.weekStartDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-white/60">Loading status...</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">⚡ Quick Actions</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleUpgradeToMonthly}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              💎 Upgrade to Monthly
            </button>

            <button
              onClick={handleUpgradeToAnnual}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              👑 Upgrade to Annual
            </button>

            <button
              onClick={handleResetToFree}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🆓 Reset to Free
            </button>

            <button
              onClick={handleResetConversations}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Reset Count
            </button>

            <button
              onClick={handleSetMaxConversations}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              ⚠️ Set to Max (3/3)
            </button>

            <button
              onClick={refreshStatus}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">📖 Instructions</h2>
          <div className="text-white/80 space-y-2">
            <p>• <strong>Monthly Premium</strong>: Unlimited conversations per month</p>
            <p>• <strong>Annual Premium</strong>: Unlimited conversations per year</p>
            <p>• <strong>Free</strong>: 3 conversations per week limit</p>
            <p className="mt-4 text-yellow-300">
              💡 Tip: After switching, visit <Link href="/demo" className="underline">/demo</Link> to see the effect
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            🏠 Home
          </Link>
          <Link
            href="/demo"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            🎯 Scenarios
          </Link>
          <Link
            href="/feedback"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            📊 Feedback
          </Link>
        </div>
      </div>
    </main>
  );
}
