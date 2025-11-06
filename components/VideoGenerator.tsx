import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import VideoIcon from './icons/VideoIcon.tsx';

const aspectRatios = ["16:9", "9:16"] as const;
type AspectRatio = typeof aspectRatios[number];

const resolutions = ["720p", "1080p"] as const;
type Resolution = typeof resolutions[number];

const loadingMessages = [
    "Warming up the video director AI...",
    "Storyboarding your concept...",
    "Setting up the virtual cameras...",
    "Rendering the first few frames...",
    "Applying visual effects...",
    "This is taking a bit longer than usual, but we're getting there...",
    "Compositing scenes together...",
    "Adding the final touches...",
    "Almost ready to roll!",
];

const VideoGenerator: React.FC = () => {
    // UI State
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [resolution, setResolution] = useState<Resolution>('720p');

    // API & Generation State
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isStudioEnv, setIsStudioEnv] = useState(false);

    const messageIntervalRef = useRef<number | null>(null);

    // Check for API key and environment on mount
    useEffect(() => {
        const checkEnvironment = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                setIsStudioEnv(true);
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(hasKey);
            } else {
                setIsStudioEnv(false);
                console.warn("AI Studio environment not detected. Video generation will be disabled.");
            }
        };
        checkEnvironment();
    }, []);

    // Cleanup video URL blob
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    // Cycle through loading messages
    useEffect(() => {
        if (isLoading) {
            let messageIndex = 0;
            setLoadingMessage(loadingMessages[messageIndex]);
            messageIntervalRef.current = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 5000);
        } else {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
                messageIntervalRef.current = null;
            }
        }
        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        };
    }, [isLoading]);

    const handleSelectKey = async () => {
        if (!isStudioEnv) return;
        await window.aistudio.openSelectKey();
        // Assume key selection is successful and let the next API call verify.
        setHasApiKey(true);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a video.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            // Re-create instance to ensure latest key is used
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: aspectRatio
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.error) {
                throw new Error(operation.error.message);
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) {
                throw new Error("Video generation succeeded but no download link was provided.");
            }

            setLoadingMessage("Downloading your video...");
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }

            const videoBlob = await videoResponse.blob();
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);

        } catch (e: any) {
            console.error("Video generation error:", e);
            let errorMessage = "Failed to generate video. Please try again with a different prompt.";
            if (e.message?.includes("Requested entity was not found.")) {
                errorMessage = "API Key not found or invalid. Please select a valid API key.";
                setHasApiKey(false); // Reset key state
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isStudioEnv) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[var(--background-secondary)]">
                <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Video Generation Unavailable</h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-lg">
                    This feature requires the Google AI Studio environment to function correctly.
                </p>
            </div>
        );
    }

    if (!hasApiKey) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[var(--background-secondary)]">
                <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">API Key Required for Video Generation</h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-lg">
                    The Veo video generation model requires a project-linked API key. Please select your key to continue.
                    Video generation may incur costs. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-text)] underline">billing information</a> for details.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="px-6 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold rounded-lg transition-colors"
                >
                    Select API Key
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[var(--background-secondary)] text-[var(--text-primary)]">
            <div className="p-4 sm:p-8 bg-gradient-to-b from-[var(--background-primary)] to-[var(--background-secondary)]/80 text-center">
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">Video Generation (Veo)</h2>
                <p className="text-[var(--text-secondary)] mt-2">Bring your ideas to life with AI-powered video creation.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    {/* Input Section */}
                    <div className="bg-[var(--background-primary)]/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video you want to create... (e.g., A neon hologram of a cat driving at top speed)"
                            disabled={isLoading}
                            className="w-full h-24 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] transition-shadow resize-none"
                            aria-label="Video generation prompt"
                        />
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Aspect Ratio */}
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-[var(--text-primary)]">Aspect:</span>
                                    <div className="flex space-x-1 bg-[var(--background-tertiary)] p-1 rounded-md">
                                        {aspectRatios.map((ratio) => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`px-3 py-1 text-sm font-medium rounded ${
                                                aspectRatio === ratio ? 'bg-[var(--accent-primary)] text-white' : 'hover:bg-[var(--background-hover)] text-[var(--text-primary)]'
                                                } transition-colors`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Resolution */}
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-[var(--text-primary)]">Quality:</span>
                                    <div className="flex space-x-1 bg-[var(--background-tertiary)] p-1 rounded-md">
                                        {resolutions.map((res) => (
                                            <button
                                                key={res}
                                                onClick={() => setResolution(res)}
                                                className={`px-3 py-1 text-sm font-medium rounded ${
                                                resolution === res ? 'bg-[var(--accent-primary)] text-white' : 'hover:bg-[var(--background-hover)] text-[var(--text-primary)]'
                                                } transition-colors`}
                                            >
                                                {res}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                    <span>Generating...</span>
                                </>
                                ) : (
                                <span>Generate Video</span>
                                )}
                            </button>
                        </div>
                        {error && <p className="text-[var(--danger-text)] text-sm text-center mt-3">{error}</p>}
                    </div>

                    {/* Display Section */}
                    <div className="mt-8 flex-1 flex items-center justify-center bg-[var(--background-primary)] rounded-lg p-4 min-h-[40vh] border border-[var(--border-primary)]">
                        {isLoading && (
                            <div className="text-center text-[var(--text-secondary)]">
                                <div className="w-10 h-10 border-4 border-t-transparent border-[var(--accent-border)] rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="transition-opacity duration-500">{loadingMessage}</p>
                            </div>
                        )}
                        {!isLoading && videoUrl && (
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                className="max-w-full max-h-[70vh] object-contain rounded-md shadow-2xl"
                            />
                        )}
                        {!isLoading && !videoUrl && (
                            <div className="text-center text-[var(--text-muted)]">
                                <VideoIcon />
                                <p className="mt-4">Your generated video will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;