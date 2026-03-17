import { ChevronDown, Plus } from "lucide-react";

const ProductVariantStep = ({ variants, onAddVariantClick, onRemoveVariant, onUpdateVariantName, onAddOption, onRemoveOption }) => {
  return (
    <div className="relative p-5 mt-8">
      <div className="before:absolute before:inset-0 before:mx-3 before:-mb-3 before:border before:border-foreground/10 before:bg-background/30 before:shadow-md before:z-[-1] before:rounded-xl after:absolute after:inset-0 after:border after:border-foreground/10 after:bg-background after:shadow-md after:rounded-xl after:z-[-1] after:backdrop-blur-md" />
      <div className="rounded-lg border p-5 relative z-10 bg-white">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Product Variant
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full">
              <div className="font-medium">Product Variant</div>
              <p className="mt-3 text-xs opacity-70 leading-relaxed">
                Add variants such as color, size, or more. Choose a maximum of 2 variant types.
              </p>
            </div>
            <div className="mt-3 xl:mt-0 w-full xl:text-right">
              <button
                type="button"
                onClick={onAddVariantClick}
                className="inline-flex items-center gap-2 h-10 px-4 py-2 rounded-lg text-sm font-medium border border-primary/60 text-primary hover:bg-primary/5"
              >
                <Plus className="size-4" />
                Add Variant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantStep;
