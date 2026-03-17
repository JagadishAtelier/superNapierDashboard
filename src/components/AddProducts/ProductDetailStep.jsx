import { useState, useRef, useEffect } from "react";
import { ChevronDown, Paperclip, X } from "lucide-react";

const meatCuts = [
  "Egg",
  "Eggless"
];

const cakeFlavors = [
  "Chocolate",
  "Black Forest",
  "Red Velvet",
  "Fruit",
  "Vanilla",
  "Butterscotch",
  "Strawberry"
];

const ProductDetailStep = ({
  description,
  setDescription,
  tamilDescription,
  setTamilDescription,
  cutType = [], // default to empty array
  setCutType,
  shelfLife,
  setShelfLife,
  storageInstructions,
  setStorageInstructions,
  videoUrl,
  setVideoUrl,
  onAddVideoClick,
  flavor,
  setFlavor,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [isFlavorDropdownOpen, setIsFlavorDropdownOpen] = useState(false);
  const flavorDropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {

      // Close Cake Type dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }

      // Close Cake Flavor dropdown
      if (
        flavorDropdownRef.current &&
        !flavorDropdownRef.current.contains(e.target)
      ) {
        setIsFlavorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCut = (cut) => {
    const currentCuts = cutType || [];
    let updatedCuts;
    if (currentCuts.includes(cut)) {
      updatedCuts = currentCuts.filter((c) => c !== cut);
    } else {
      updatedCuts = [...currentCuts, cut];
    }
    setCutType(updatedCuts);
    console.log("Selected Cuts:", updatedCuts);
  };

  const toggleFlavor = (selectedFlavor) => {
    const currentFlavors = flavor || [];
    let updatedFlavors;

    if (currentFlavors.includes(selectedFlavor)) {
      updatedFlavors = currentFlavors.filter((f) => f !== selectedFlavor);
    } else {
      updatedFlavors = [...currentFlavors, selectedFlavor];
    }

    setFlavor(updatedFlavors);
  };

  return (
    <div className="relative p-5 mt-8">
      <div className="rounded-lg border p-5 relative z-10 bg-white">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Product Detail
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Product Description */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Product Description</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the cake flavor, ingredients, weight, and customization details..."
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Tamil Description */}
          {/* <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Tamil Description</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <textarea
                value={tamilDescription}
                onChange={(e) => setTamilDescription(e.target.value)}
                rows={6}
                placeholder="உங்கள் தயாரிப்பைப் தமிழில் விவரிக்கவும்..."
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div> */}


          {/* Cut Type */}
          <div className="flex flex-col xl:flex-row items-start relative">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Cake Type</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full relative" ref={dropdownRef}>
              <div
                className="border rounded-md px-3 py-2 flex flex-wrap gap-1 items-center cursor-pointer min-h-[44px]"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {(!cutType || cutType.length === 0) && (
                  <span className="text-gray-400">Select cake types...</span>
                )}
                {cutType?.map((cut) => (
                  <div
                    key={cut}
                    className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
                  >
                    {cut}
                    <X
                      className="ml-1 cursor-pointer"
                      size={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCut(cut);
                      }}
                    />
                  </div>
                ))}
                <ChevronDown className="ml-auto size-4" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto border rounded-md bg-white z-20 shadow-lg mt-1">
                  {meatCuts.map((cut) => (
                    <div
                      key={cut}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCut(cut);
                      }}
                      className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${cutType?.includes(cut) ? "bg-indigo-100 font-semibold" : ""
                        }`}
                    >
                      {cut}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cake Flavor */}
          {/* Cake Flavor */}
          <div className="flex flex-col xl:flex-row items-start relative">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Cake Flavor</div>
            </div>

            <div
              className="mt-3 xl:mt-0 flex-1 w-full relative"
              ref={flavorDropdownRef}
            >
              <div
                className="border rounded-md px-3 py-2 flex flex-wrap gap-1 items-center cursor-pointer min-h-[44px]"
                onClick={() => setIsFlavorDropdownOpen(!isFlavorDropdownOpen)}
              >
                {(!flavor || flavor.length === 0) && (
                  <span className="text-gray-400">Select cake flavors...</span>
                )}

                {flavor?.map((item) => (
                  <div
                    key={item}
                    className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
                  >
                    {item}
                    <X
                      className="ml-1 cursor-pointer"
                      size={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlavor(item);
                      }}
                    />
                  </div>
                ))}

                <ChevronDown className="ml-auto size-4" />
              </div>

              {isFlavorDropdownOpen && (
                <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto border rounded-md bg-white z-20 shadow-lg mt-1">
                  {cakeFlavors.map((item) => (
                    <div
                      key={item}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlavor(item);
                      }}
                      className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${flavor?.includes(item)
                        ? "bg-indigo-100 font-semibold"
                        : ""
                        }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shelf Life */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Shelf Life</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                placeholder="e.g., Best before 2 days when refrigerated"
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Storage Instructions */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Storage Instructions</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <textarea
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                rows={3}
                placeholder="Store in refrigerator. Keep at 0–4°C. Avoid direct sunlight."
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Product Video */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Product Video</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input
                type="url"
                placeholder="Add YouTube video link of cake preparation or decoration"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailStep;
