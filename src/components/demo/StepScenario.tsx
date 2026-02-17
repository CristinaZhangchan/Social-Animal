"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, RotateCcw, Paperclip, Mic, MicOff, FileText, Loader2, X } from "lucide-react";
import {
    SUPPORTED_LANGUAGES,
    getLanguageByCode,
    getLanguageFlag,
} from "@/lib/constants/languages";
import { toast } from "sonner";

interface StepScenarioProps {
    initialScenario: string;
    selectedLanguage: string;
    onLanguageChange: (lang: string) => void;
    onNext: (scenario: string) => void;
}

export function StepScenario({ initialScenario, selectedLanguage, onLanguageChange, onNext }: StepScenarioProps) {
    const [scenario, setScenario] = useState(initialScenario);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const selectedLang = getLanguageByCode(selectedLanguage);

    const predefinedScenarios = [
        "Returning a defective product to an unhelpful store manager",
        "Handling a difficult performance review conversation",
        "Asking my manager for a promotion after 2 years",
        "Asking someone out on a first date",
        "Negotiating with my insurance company about a claim",
        "Telling my roommate their habits are affecting me",
        "Apologizing to a friend after missing their important event",
        "Pitching my startup idea to a skeptical investor",
    ];

    // ===== File Upload =====
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadedFileName(file.name);

        try {
            const fileType = file.type;
            const fileName = file.name.toLowerCase();

            // Handle text-based files
            if (
                fileType === "text/plain" ||
                fileName.endsWith(".txt") ||
                fileName.endsWith(".md") ||
                fileName.endsWith(".csv")
            ) {
                const text = await file.text();
                const trimmed = text.trim().slice(0, 2000); // Limit to 2000 chars
                setScenario(prev => prev ? `${prev}\n\n--- Uploaded from ${file.name} ---\n${trimmed}` : trimmed);
                toast.success(`File "${file.name}" loaded successfully`);
            }
            // Handle PDF files — read as text (basic extraction)
            else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
                const arrayBuffer = await file.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                // Basic PDF text extraction: look for text between BT and ET markers
                const text = extractTextFromPDF(bytes);
                if (text.trim()) {
                    const trimmed = text.trim().slice(0, 2000);
                    setScenario(prev => prev ? `${prev}\n\n--- Uploaded from ${file.name} ---\n${trimmed}` : trimmed);
                    toast.success(`PDF "${file.name}" loaded — text extracted`);
                } else {
                    // Fallback: tell user we couldn't extract text
                    toast.error("Could not extract text from this PDF. Try a .txt or .doc file, or paste the text directly.");
                    setUploadedFileName(null);
                }
            }
            // Handle DOCX files (basic extraction from XML)
            else if (
                fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileName.endsWith(".docx")
            ) {
                // For DOCX, read as text and try to extract readable content
                const text = await file.text();
                // DOCX is a zip, so raw text won't work well. Ask user to use txt instead.
                toast.info("For best results with Word documents, please save as .txt first, or paste the content directly.");
                setUploadedFileName(null);
            }
            // Generic fallback — try reading as text
            else {
                try {
                    const text = await file.text();
                    if (text.trim()) {
                        const trimmed = text.trim().slice(0, 2000);
                        setScenario(prev => prev ? `${prev}\n\n--- Uploaded from ${file.name} ---\n${trimmed}` : trimmed);
                        toast.success(`File "${file.name}" loaded`);
                    } else {
                        toast.error("File appears to be empty or unreadable.");
                        setUploadedFileName(null);
                    }
                } catch {
                    toast.error("Could not read this file type. Try .txt, .pdf, or paste directly.");
                    setUploadedFileName(null);
                }
            }
        } catch (err) {
            console.error("File upload error:", err);
            toast.error("Failed to read the file. Please try again.");
            setUploadedFileName(null);
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be re-uploaded
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, []);

    // Basic PDF text extraction (pulls text strings from PDF stream)
    function extractTextFromPDF(bytes: Uint8Array): string {
        let text = "";
        const str = new TextDecoder("latin1").decode(bytes);
        // Match text between parentheses in PDF text commands
        const regex = /\(([^)]*)\)/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
            const chunk = match[1];
            // Filter out binary junk (only keep printable ASCII)
            if (chunk.length > 1 && /^[\x20-\x7E\s]+$/.test(chunk)) {
                text += chunk + " ";
            }
        }
        return text;
    }

    const clearUploadedFile = () => {
        setUploadedFileName(null);
    };

    // ===== Voice Input (Speech-to-Text) =====
    const toggleVoiceInput = useCallback(() => {
        if (isRecording) {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        // Start recording
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            toast.error("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage === "en" ? "en-US" :
            selectedLanguage === "zh" ? "zh-CN" :
                selectedLanguage === "es" ? "es-ES" :
                    selectedLanguage === "fr" ? "fr-FR" :
                        selectedLanguage === "de" ? "de-DE" :
                            selectedLanguage === "ja" ? "ja-JP" :
                                selectedLanguage === "ko" ? "ko-KR" :
                                    selectedLanguage === "pt" ? "pt-BR" :
                                        selectedLanguage === "it" ? "it-IT" :
                                            selectedLanguage === "ru" ? "ru-RU" :
                                                selectedLanguage;

        let finalTranscript = "";

        recognition.onresult = (event: any) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + " ";
                } else {
                    interimTranscript = result[0].transcript;
                }
            }
            // Update the scenario with recorded text
            setScenario(prev => {
                const base = prev.replace(/\n🎙️ .*$/, ""); // Remove previous interim marker
                const combined = (base ? base + " " : "") + finalTranscript;
                if (interimTranscript) {
                    return combined + "\n🎙️ " + interimTranscript;
                }
                return combined.trim();
            });
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
            } else if (event.error !== "aborted") {
                toast.error("Speech recognition error. Please try again.");
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            // Clean up any interim markers
            setScenario(prev => prev.replace(/\n🎙️ .*$/, "").trim());
            if (finalTranscript.trim()) {
                toast.success("Voice input captured!");
            }
        };

        recognition.start();
        setIsRecording(true);
        toast.info("🎙️ Listening... Speak now", { duration: 2000 });
    }, [isRecording, selectedLanguage]);

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-foreground">
                    What conversation would you like to practice?
                </h1>
                <p className="text-lg text-muted-foreground">
                    Describe any situation or upload a document like a job description
                </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm mb-8">
                {/* Language Selection inside the card (or above input) */}
                <div className="mb-4 flex justify-end">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-background/50 hover:bg-background border border-border rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <span className="text-base">{getLanguageFlag(selectedLanguage)}</span>
                            <span>{selectedLang?.name}</span>
                            <svg
                                className={`w-3 h-3 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isLanguageDropdownOpen && (
                            <div className="absolute right-0 z-50 mt-2 w-64 max-h-60 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                            onLanguageChange(lang.code);
                                            setIsLanguageDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-accent transition-colors ${selectedLanguage === lang.code ? "bg-primary/10 text-primary" : "text-popover-foreground"
                                            }`}
                                    >
                                        <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                                        <span className="text-sm">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Textarea
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        placeholder="Describe any real-life conversation you want to rehearse...
            
For example: 'Asking my manager for a raise' or 'Breaking difficult news to a friend'"
                        className="min-h-[160px] bg-transparent border-none resize-none text-lg p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground"
                    />
                    <div className="absolute bottom-0 right-0 flex items-center gap-1">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.pdf,.doc,.docx,.md,.csv,text/plain,application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Uploaded file indicator */}
                        {uploadedFileName && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium mr-1">
                                <FileText className="h-3 w-3" />
                                <span className="max-w-[100px] truncate">{uploadedFileName}</span>
                                <button onClick={clearUploadedFile} className="hover:text-destructive transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {/* Upload Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            title="Upload a document (.txt, .pdf)"
                        >
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Paperclip className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Voice Input Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`transition-all ${isRecording
                                    ? "text-destructive bg-destructive/10 hover:bg-destructive/20 animate-pulse"
                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                }`}
                            onClick={toggleVoiceInput}
                            title={isRecording ? "Stop recording" : "Start voice input"}
                        >
                            {isRecording ? (
                                <MicOff className="h-5 w-5" />
                            ) : (
                                <Mic className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Recording indicator bar */}
                {isRecording && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-xl animate-in fade-in duration-300">
                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        <span className="text-sm text-destructive font-medium">Recording... Click the mic button to stop</span>
                    </div>
                )}
            </div>

            <Button
                onClick={() => onNext(scenario)}
                disabled={!scenario.trim()}
                className="w-full py-7 text-lg rounded-xl font-semibold bg-sa-light-accent hover:bg-sa-light-accent/90 text-white dark:bg-sa-accent-cyan dark:hover:bg-sa-accent-cyan/90 dark:text-sa-bg-primary shadow-lg shadow-sa-light-accent/20 dark:shadow-sa-accent-cyan/20 transition-all"
            >
                <SparklesIcon className="mr-2 h-5 w-5" />
                Create Session
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground">Or try one of these:</p>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Shuffle
                    </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {predefinedScenarios.map((text) => (
                        <button
                            key={text}
                            onClick={() => setScenario(text)}
                            className="px-4 py-3 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-2xl text-sm text-left transition-colors border border-transparent hover:border-primary/20"
                        >
                            {text.length > 50 ? text.substring(0, 50) + "..." : text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z"
                clipRule="evenodd"
            />
        </svg>
    );
}
