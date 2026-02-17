export interface Avatar {
    id: string;
    name: string;
    role: string;
    description: string;
    imageUrl?: string; // In a real app, this would be a URL
    initial: string; // Fallback if no image
    voiceId: string; // Placeholder for TTS voice ID
}

export const AVATARS: Avatar[] = [
    {
        id: "brenda",
        name: "Brenda",
        role: "Store Manager, 'Gadget Haven'",
        description: "Brenda is a by-the-book manager who takes pride in adhering to store policies. She's often stressed due to understaffing and dealing with frequent customer complaints, which has made her somewhat jaded.",
        initial: "B",
        voiceId: "brenda_voice_id",
    },
    {
        id: "marcus",
        name: "Marcus",
        role: "Senior Developer",
        description: "Marcus is a pragmatic senior developer who values clean code and efficiency. He can be skeptical of new technologies but respects well-reasoned arguments.",
        initial: "M",
        voiceId: "marcus_voice_id",
    },
    {
        id: "sarah",
        name: "Sarah",
        role: "HR specialist",
        description: "Sarah is a friendly but professional HR specialist. She focuses on cultural fit and behavioral questions.",
        initial: "S",
        voiceId: "sarah_voice_id",
    },
    {
        id: "alex",
        name: "Alex",
        role: "Startup Founder",
        description: "Alex is a high-energy startup founder looking for passion and drive. He asks unconventional questions and values creativity.",
        initial: "A",
        voiceId: "alex_voice_id",
    },
    {
        id: "priya",
        name: "Priya",
        role: "Project Manager",
        description: "Priya is organized and detail-oriented. She values clear communication and deadline adherence.",
        initial: "P",
        voiceId: "priya_voice_id"
    }
];
