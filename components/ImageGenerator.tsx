import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ImageIcon from './icons/ImageIcon.tsx';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
type AspectRatio = typeof aspectRatios[number];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const generatedImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      setImageUrl(generatedImageUrl);

    } catch (e) {
      console.error("Image generation error:", e);
      setError("Failed to generate image. The model may have refused the prompt. Please try again with a different prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background-secondary)] text-[var(--text-primary)]">
      <div className="p-4 sm:p-8 bg-gradient-to-b from-[var(--background-primary)] to-[var(--background-secondary)]/80 text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Image Generation</h2>
        <p className="text-[var(--text-secondary)] mt-2">Create stunning visuals with the power of AI.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Input Section */}
          <div className="bg-[var(--background-primary)]/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the image you want to create... (e.g., A robot holding a red skateboard)"
              disabled={isLoading}
              className="w-full h-24 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] transition-shadow resize-none"
              aria-label="Image generation prompt"
            />
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[var(--text-primary)]">Aspect Ratio:</span>
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
                  <span>Generate Image</span>
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
                <p>Creating your vision... this may take a moment.</p>
              </div>
            )}
            {!isLoading && imageUrl && (
              <img
                src={imageUrl}
                alt={prompt}
                className="max-w-full max-h-[70vh] object-contain rounded-md shadow-2xl"
              />
            )}
            {!isLoading && !imageUrl && (
              <div className="text-center text-[var(--text-muted)]">
                <ImageIcon />
                <p className="mt-4">Your generated image will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;