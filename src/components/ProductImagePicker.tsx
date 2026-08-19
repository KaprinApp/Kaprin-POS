import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Link as LinkIcon, Sparkles } from 'lucide-react';

interface ProductImagePickerProps {
  imageUrl?: string;
  onChange: (url: string) => void;
  category?: string;
}

const PRESET_IMAGES = [
  {
    name: 'Shirt (ရှပ်အင်္ကျီ)',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'T-Shirt (တီရှပ်ဖြူ)',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Denim (ဂျင်းအင်္ကျီ)',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Jeans (ဂျင်းဘောင်းဘီ)',
    url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cap (ဦးထုပ်)',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Card / PVC (ကတ်)',
    url: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Shoes (ဖိနပ်)',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Watch (လက်ပတ်နာရီ)',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bag (လွယ်အိတ်)',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cosmetics / Skin (အလှကုန်)',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Snack / Drink (မုန့်/အချိုရည်)',
    url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=80',
  },
];

export const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  imageUrl,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress & convert file to compact Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(compressedDataUrl);
        } else {
          onChange(event.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('ပုံရိပ် ဖွင့်မရပါ!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setUrlInputOpen(false);
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#ff6600]" />
          <span>ပစ္စည်းပုံ (Product Image):</span>
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <X className="w-3 h-3" />
            <span>ပုံဖျက်မည်</span>
          </button>
        )}
      </div>

      <div className="flex items-start space-x-3">
        {/* Preview Box */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shrink-0 flex items-center justify-center group shadow-2xs">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center p-1 text-gray-400">
              <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-300" />
              <span className="text-[9px] block leading-tight">ပုံမရှိသေးပါ</span>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
              Processing...
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-1.5 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap gap-1.5">
            {/* Direct Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2.5 bg-orange-50 hover:bg-orange-100 text-[#ff6600] font-bold rounded-lg border border-orange-200 flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ဖုန်း/ကွန်ပျူတာမှ တင်မည်</span>
            </button>

            {/* Presets Button */}
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg border border-gray-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>နမူနာပုံ ရွေးမည်</span>
            </button>

            {/* Link Button */}
            <button
              type="button"
              onClick={() => setUrlInputOpen(!urlInputOpen)}
              className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg border border-gray-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Link ထည့်မည်</span>
            </button>
          </div>

          <p className="text-[10px] text-gray-500">
            JPG, PNG, WebP ပုံများကို တိုက်ရိုက် ရွေးချယ်နိုင်ပါသည်။
          </p>

          {/* URL Input Bar */}
          {urlInputOpen && (
            <div className="flex items-center space-x-1.5 pt-1 animate-in fade-in">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/image.jpg..."
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#ff6600]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-xs cursor-pointer hover:bg-blue-700"
              >
                ထည့်မည်
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preset Image Gallery Palette */}
      {showPresets && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 animate-in fade-in space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 border-b pb-1">
            <span>နမူနာ ပစ္စည်းပုံစံများ (Preset Images):</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {PRESET_IMAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setShowPresets(false);
                }}
                className="group p-1 bg-white rounded-lg border border-gray-200 hover:border-[#ff6600] flex flex-col items-center cursor-pointer transition-all shadow-2xs hover:scale-105"
                title={preset.name}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-10 h-10 object-cover rounded-md mb-1"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] text-gray-700 font-medium truncate w-full text-center group-hover:text-[#ff6600]">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
