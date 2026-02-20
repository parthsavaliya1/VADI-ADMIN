import { X, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function ImagePopup({
  imageUrl,
  name,
  isOpen,
  onClose,
  prompt,
  userIconUrl,
  imageLink,
}: {
  imageUrl: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  userIconUrl: string;
  imageLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(100);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(imageLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1500);
  };

  const togglePrompt = () => setShowFullPrompt(!showFullPrompt);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 px-2 sm:px-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-black hover:text-gray-700"
      >
        <X size={30} />
      </button>

      <div className="flex flex-col sm:flex-row w-full max-w-5xl h-[90vh] sm:h-[85vh] overflow-hidden rounded-lg bg-white shadow-xl border border-zinc-200">
        {/* Image Section */}
        <div className="flex-1 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-zinc-200 p-4 bg-white">
          <div className="flex-1 flex flex-col justify-center items-center overflow-auto">
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <img
                src={imageUrl}
                alt="popup"
                style={{ transform: `scale(${zoom / 100})` }}
                className="rounded-md transition-transform duration-300 origin-center max-w-full max-h-full"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 justify-end px-3 py-2 rounded-md shadow-md bg-gray-50">
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-[80px] h-2"
            />
            <span className="text-xs text-gray-700">{zoom}%</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="sm:w-[350px] w-full text-black p-6 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src={userIconUrl}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{name}</span>
            </div>

            <div>
              <div className="flex items-center mb-1">
                <h3 className="font-semibold">Prompt</h3>
                <button
                  onClick={handleCopyPrompt}
                  className="text-gray-500 hover:text-black ml-3"
                  title="Copy prompt"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {showFullPrompt || prompt.length < 180
                  ? prompt
                  : `${prompt.slice(0, 180)}... `}
                {prompt.length > 180 && (
                  <button
                    onClick={togglePrompt}
                    className="text-blue-600 ml-1 hover:underline"
                  >
                    {showFullPrompt ? "Show less" : "See more"}
                  </button>
                )}
              </p>
              {copiedPrompt && (
                <p className="text-green-500 text-xs mt-1">Prompt copied!</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="px-2 py-1 border border-zinc-300 rounded">
                3:4
              </span>
              <span className="px-2 py-1 border border-zinc-300 rounded">
                flux 1.0
              </span>
              <span className="px-2 py-1 border border-zinc-300 rounded">
                text to image
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded w-full justify-center"
            >
              <Copy size={16} />
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
