import { useState } from "react";
import { ChevronDown, X, Plus } from "lucide-react";

const ProductVariant = ({
  variantName = "",
  options = [],
  onRemove,
  onNameChange,
  onOptionsChange,
}) => {
  const [localName, setLocalName] = useState(variantName);

  const handleNameChange = (e) => {
    setLocalName(e.target.value);
    onNameChange && onNameChange(e.target.value);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index].value = value;
    onOptionsChange && onOptionsChange(updatedOptions);
  };

  const addOption = () => {
    if (options.length >= 5) return;
    const newOptions = [...options, { id: Date.now(), value: "" }];
    onOptionsChange && onOptionsChange(newOptions);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange && onOptionsChange(newOptions);
  };

  return (
    <div className="relative p-5 mt-8 box before:absolute before:inset-0 before:mx-3 before:-mb-3 before:border before:border-foreground/10 before:bg-background/30 before:shadow-[0px_3px_5px_#0000000b] before:z-[-1] before:rounded-xl after:absolute after:inset-0 after:border after:border-foreground/10 after:bg-background after:shadow-[0px_3px_5px_#0000000b] after:rounded-xl after:z-[-1] after:backdrop-blur-md">
      <div className="rounded-lg border p-5 bg-white relative z-10">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Product Variant (Details)
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Variant Name */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="text-left">
                <div className="font-medium">Variant Name</div>
                <div className="mt-3 text-xs leading-relaxed text-gray-500">
                  Add the name of the variant (e.g., With Skin, With out skin).
                </div>
              </div>
            </div>

            <div className="mt-3 w-full flex-1 xl:mt-0">
              <div className="relative rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-5 xl:pr-10 flex items-center">
                <input
                  type="text"
                  value={localName}
                  onChange={handleNameChange}
                  placeholder="e.g., Size"
                  maxLength={14}
                  className="h-10 flex-1 rounded border border-r-0 bg-white px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="bg-gray-100 border border-l-0 text-gray-500 flex w-16 items-center justify-center rounded-md">
                  {localName.length}/14
                </div>
                <button
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={onRemove}
                  title="Remove Variant"
                >
                  <X className="size-5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Variant Options */}
          <div className="flex flex-col gap-3">
            {options.map((opt, index) => (
              <div key={opt.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={opt.value}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 h-10 rounded border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-2 py-1 text-red-600 border border-red-400 rounded-md hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-sm"
              disabled={options.length >= 5}
            >
              <Plus className="size-4" />
              Add Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariant;
