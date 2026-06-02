import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

export const DragDropImage = ({ value, onChange, disabled }) => {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB");
        return;
      }
      onChange(file);
    },
    [onChange],
  );

  const preview = value
    ? typeof value === "string"
      ? value
      : URL.createObjectURL(value)
    : null;

  return (
    <div className="w-full">
      {preview ? (
        <div
          className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50"
          data-testid="image-preview-wrapper"
        >
          <img
            src={preview}
            alt="preview"
            className="w-full aspect-[4/3] object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white rounded-full p-1.5"
              data-testid="remove-image-btn"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          data-testid="dropzone"
          className={`w-full border-2 border-dashed rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-[#FF5A1F] transition-all flex flex-col items-center justify-center p-12 text-center ${
            drag ? "border-[#FF5A1F] bg-orange-50" : "border-gray-300"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
            <UploadCloud className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            Drag & drop an image
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or click to browse · PNG, JPG up to 5MB
          </p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        data-testid="file-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};
