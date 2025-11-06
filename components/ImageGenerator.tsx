import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ImageIcon from './icons/ImageIcon';

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
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="p-4 sm:p-8 bg-gradient-to-b from-gray-900 to-gray-800/80 text-center">
        <h2 className="text-3xl font-bold text-white">Image Generation</h2>
        <p className="text-gray-400 mt-2">Create stunning visuals with the power of AI.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Input Section */}
          <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the image you want to create... (e.g., A robot holding a red skateboard)"
              disabled={isLoading}
              className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
              aria-label="Image generation prompt"
            />
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-300">Aspect Ratio:</span>
                <div className="flex space-x-1 bg-gray-700 p-1 rounded-md">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        aspectRatio === ratio ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'
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
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
          </div>

          {/* Display Section */}
          <div className="mt-8 flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-4 min-h-[40vh] border border-gray-700">
            {isLoading && (
              <div className="text-center text-gray-400">
                <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
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
              <div className="text-center text-gray-500">
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