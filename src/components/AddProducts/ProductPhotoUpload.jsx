import { useRef, useState, useEffect } from "react";
import { Lightbulb, Image, X, ChevronDown } from "lucide-react";

const ProductPhotoUpload = ({ initialImages = [], onImagesChange }) => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);

  // Normalize initial images (Cloudinary URLs)
  useEffect(() => {
    if (initialImages.length) {
      const formatted = initialImages
        .filter((img) => img != null)  // ignore null/undefined
        .map((img) => {
          if (typeof img === "string") {
            return { preview: img, isExisting: true };
          }
          if (img instanceof File) {
            return { preview: URL.createObjectURL(img), file: img, isExisting: false };
          }
          if (img?.secure_url || img?.url) {
            return { preview: img.secure_url || img.url, isExisting: true };
          }
          return { preview: "", isExisting: true };
        });
      setImages(formatted);
    }
  }, [initialImages]);
  
  

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    const newImages = [...images, ...previews].slice(0, 5);
    setImages(newImages);

    onImagesChange &&
      onImagesChange(
        newImages.map((img) => (img.isExisting ? img.preview : img.file))
      );
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    onImagesChange &&
      onImagesChange(
        newImages.map((img) => (img.isExisting ? img.preview : img.file))
      );
  };

  return (
    <div className="relative p-5">
      <div className="rounded-lg border p-5 bg-white relative z-10">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Upload Product
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Info */}
          <div className="mb-5 flex items-center text-sm text-gray-700">
            <Lightbulb className="text-yellow-500 h-5 w-5" />
            <div className="ml-2">
              Avoid selling counterfeit products to prevent deletion.{" "}
              <a
                className="text-indigo-600 font-medium"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-xl border-2 border-dashed pt-4 pb-6">
              {/* Preview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative h-28 rounded-xl shadow group"
                  >
                    {img.preview ? (
                      <img
                        src={img.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Preview
                      </div>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-[-5px] right-[-5px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700 z-10"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload */}
              <div
                className="mt-6 flex justify-center items-center gap-2 cursor-pointer relative"
                onClick={() => fileInputRef.current.click()}
              >
                <Image className="size-4 text-indigo-500" />
                <span className="text-indigo-600 font-medium">
                  Upload a file
                </span>{" "}
                or drag and drop
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesChange}
                ref={fileInputRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoUpload;
