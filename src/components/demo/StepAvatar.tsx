"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Volume2 } from "lucide-react";
import { AVATARS, Avatar } from "@/lib/constants/avatars";

interface StepAvatarProps {
    initialData: {
        avatarId: string;
        customName: string;
        customRole: string;
        customPersonality: string;
        avatarUrl?: string; // Add this
    };
    onNext: (data: any) => void;
    onBack: () => void;
}

export function StepAvatar({ initialData, onNext, onBack }: StepAvatarProps) {
    const [selectedAvatarId, setSelectedAvatarId] = useState(initialData.avatarId || AVATARS[0].id);
    const [customData, setCustomData] = useState({
        name: initialData.customName,
        role: initialData.customRole,
        personality: initialData.customPersonality,
        avatarUrl: initialData.avatarUrl || "", // Add state
    });

    const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId) || AVATARS[0];

    // If user edits text, we are technically in "custom" mode for that field,
    // but for simplicity, we just init the fields with the selected avatar's data if empty
    const currentName = customData.name || selectedAvatar.name;
    const currentRole = customData.role || selectedAvatar.role;
    const currentPersonality = customData.personality || selectedAvatar.description;

    // HeyGen Integration
    const [heygenAvatars, setHeygenAvatars] = useState<any[]>([]);
    const [isLoadingHeyGen, setIsLoadingHeyGen] = useState(false);

    useEffect(() => {
        async function fetchHeyGenAvatars() {
            setIsLoadingHeyGen(true);
            try {
                const res = await fetch('/api/heygen/avatars');
                if (res.ok) {
                    const data = await res.json();
                    if (data.data && data.data.avatars) {
                        setHeygenAvatars(data.data.avatars);
                    }
                }
            } catch (error) {
                console.error("Failed to load HeyGen avatars", error);
            } finally {
                setIsLoadingHeyGen(false);
            }
        }

        fetchHeyGenAvatars();
    }, []);

    const handleAvatarSelect = (avatar: any) => {
        setSelectedAvatarId(avatar.id);
        // If it's a HeyGen avatar (doesn't have 'initial' property from our constants), set URL if available
        if (avatar.preview_image_url) { // This covers HeyGen avatars and potentially custom ones if they have this prop
            setCustomData(prev => ({
                ...prev,
                avatarUrl: avatar.preview_image_url,
                // For HeyGen avatars, we don't usually get name/role/personality from the avatar object itself,
                // so we keep the current customData for those fields.
                // If we want to reset them, we'd need to decide on a default.
            }));
        } else if (avatar.initial) { // This is a preset avatar from AVATARS
            setCustomData({
                name: avatar.name,
                role: avatar.role,
                personality: avatar.description,
                avatarUrl: "", // Reset custom URL if selecting a preset
            });
        } else { // This might be the "custom" button, or an unknown type
            setCustomData(prev => ({ ...prev, avatarUrl: "" })); // Clear URL if it's not a HeyGen or preset
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 font-serif">Choose your conversation partner</h1>
                <p className="text-muted-foreground">
                    Pick who you'll be talking to and how they sound.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Configuration */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Their name</label>
                        <Input
                            value={customData.name || selectedAvatar.name}
                            onChange={(e) => setCustomData({ ...customData, name: e.target.value })}
                            placeholder="e.g. Marcus"
                            className="bg-card/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Their role</label>
                        <Input
                            value={customData.role || selectedAvatar.role}
                            onChange={(e) => setCustomData({ ...customData, role: e.target.value })}
                            placeholder="e.g. Senior Developer"
                            className="bg-card/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Personality & behavior</label>
                        <Textarea
                            value={customData.personality || selectedAvatar.description}
                            onChange={(e) => setCustomData({ ...customData, personality: e.target.value })}
                            className="bg-card/50 min-h-[120px]"
                        />
                    </div>
                </div>

                {/* Right Column: Visual Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Choose a face</label>

                    {/* HeyGen Avatars (Primary) */}
                    <div className="space-y-4">
                        {isLoadingHeyGen ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <p className="text-sm">Loading your avatars...</p>
                            </div>
                        ) : heygenAvatars.length > 0 ? (
                            <div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                                    {/* Upload Button First */}
                                    <button
                                        onClick={() => {
                                            setSelectedAvatarId("custom");
                                            setCustomData(prev => ({ ...prev, avatarUrl: "" }));
                                        }}
                                        className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center transition-all border-2 border-dashed ${selectedAvatarId === "custom"
                                            ? "border-sa-light-accent bg-sa-light-accent/10 dark:border-sa-accent-cyan dark:bg-sa-accent-cyan/10 text-sa-light-accent dark:text-sa-accent-cyan"
                                            : "border-border hover:border-foreground/50 text-muted-foreground hover:bg-secondary/50"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mb-2">
                                            <span className="text-xl">+</span>
                                        </div>
                                        <span className="text-[10px] font-medium">Upload</span>
                                    </button>

                                    {/* Render Unique Avatars */}
                                    {(() => {
                                        // Deduplicate logic: Group by base name
                                        const seenNames = new Set();
                                        const uniqueAvatars = heygenAvatars.filter(avatar => {
                                            // Normalize name (remove everything after first dash or parenthesis for simpler grouping, or just use exact name)
                                            // Assuming user wants distinct PERSONAS.
                                            // Simple dedupe by exact name first
                                            if (seenNames.has(avatar.avatar_name)) return false;
                                            seenNames.add(avatar.avatar_name);
                                            return true;
                                        });

                                        // Sort uniqueAvatars if needed, currently just taking first occurrence
                                        return uniqueAvatars.map((avatar) => (
                                            <button
                                                key={avatar.avatar_id}
                                                onClick={() => handleAvatarSelect({ id: avatar.avatar_id, preview_image_url: avatar.preview_image_url, name: avatar.avatar_name })}
                                                className={`aspect-[3/4] rounded-xl overflow-hidden relative transition-all group w-full ${selectedAvatarId === avatar.avatar_id
                                                    ? "ring-2 ring-offset-1 ring-offset-background ring-sa-light-accent dark:ring-sa-accent-cyan"
                                                    : "opacity-80 hover:opacity-100 hover:scale-105 border border-border/50"
                                                    }`}
                                                title={avatar.avatar_name}
                                            >
                                                <img
                                                    src={avatar.preview_image_url || avatar.thumbnail_url}
                                                    alt={avatar.avatar_name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                    <span className="text-[10px] text-white truncate w-full text-left font-medium">{avatar.avatar_name}</span>
                                                </div>
                                                {selectedAvatarId === avatar.avatar_id && (
                                                    <div className="absolute inset-0 bg-sa-light-accent/20 dark:bg-sa-accent-cyan/20 flex items-center justify-center">
                                                        <div className="w-3 h-3 rounded-full bg-white shadow-sm ring-4 ring-sa-light-accent/30 dark:ring-sa-accent-cyan/30" />
                                                    </div>
                                                )}
                                            </button>
                                        ));
                                    })()}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 text-center">Scroll for more avatars</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
                                <p className="mb-2">No HeyGen avatars found.</p>
                                <p className="text-xs opacity-70">Check your API key or create an avatar in HeyGen.</p>
                            </div>
                        )}
                    </div>
                    {selectedAvatarId === "custom" && (
                        <div className="mt-4 p-4 bg-secondary/20 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm font-medium mb-3">Upload Avatar Photo</p>

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/30 transition-colors cursor-pointer relative overflow-hidden"
                                    >
                                        {customData.avatarUrl ? (
                                            <img
                                                src={customData.avatarUrl}
                                                alt="Avatar Preview"
                                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                                            />
                                        ) : null}

                                        <div className={`relative z-10 flex flex-col items-center ${customData.avatarUrl ? "bg-black/50 p-2 rounded-lg text-white" : ""}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs font-medium">
                                                {customData.avatarUrl ? "Click to change photo" : "Click to upload photo"}
                                            </span>
                                            <span className="text-[10px] opacity-70 mt-1">JPG, PNG, WebP</span>
                                        </div>

                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setCustomData(prev => ({ ...prev, avatarUrl: url }));
                                                    // In a real app, you would upload 'file' to your server here
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-border flex-1" />
                                        <span className="text-xs text-muted-foreground">OR</span>
                                        <div className="h-px bg-border flex-1" />
                                    </div>

                                    <Input
                                        placeholder="Paste image URL..."
                                        className="bg-background/50 text-sm"
                                        value={customData.avatarUrl || ""}
                                        onChange={(e) => setCustomData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold">Integrations:</p>
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button disabled className="text-xs flex items-center justify-center gap-2 p-2 rounded-lg border border-border/50 bg-secondary/10 opacity-60 cursor-not-allowed">
                                        Connect HeyGen
                                    </button>
                                    <button disabled className="text-xs flex items-center justify-center gap-2 p-2 rounded-lg border border-border/50 bg-secondary/10 opacity-60 cursor-not-allowed">
                                        Connect Simli
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    * To retrieve avatars from HeyGen, you will need to configure your API Key in the settings.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Voice selection could go here, omitting for brevity/mock */}
            </div>

            <div className="flex gap-4 mt-12">
                <Button variant="outline" onClick={onBack} className="px-8 py-6 rounded-xl border-border/50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={() => onNext({
                        avatarId: selectedAvatarId,
                        customName: currentName,
                        customRole: currentRole,
                        customPersonality: currentPersonality,
                        avatarUrl: selectedAvatarId === "custom" ? customData.avatarUrl : undefined
                    })}
                    className="flex-1 py-6 rounded-xl font-semibold bg-sa-light-accent hover:bg-sa-light-accent/90 text-white dark:bg-sa-accent-cyan dark:hover:bg-sa-accent-cyan/90 dark:text-sa-bg-primary shadow-lg shadow-sa-light-accent/20 dark:shadow-sa-accent-cyan/20"
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
