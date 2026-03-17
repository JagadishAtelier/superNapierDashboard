// WeightShippings.jsx
import { ChevronDown } from "lucide-react";
import React from "react";

const WeightShippings = ({
  weightOptions = [],
  setWeightOptions,
  addWeightOption,
  updateWeightOption,
  removeWeightOption,
  units = [], // e.g. ["g","kg","piece"] or [{value,label}]
}) => {
  // normalize units into { value, label } objects
  const unitList = Array.isArray(units)
    ? units.map((u) => (typeof u === "string" ? { value: u, label: u } : u))
    : [];

  // internal updater wrapper (keeps component flexible)
  const updateWeight = (_id, field, rawValue) => {
    // For numeric fields convert but allow empty string
    const numericFields = ["weight", "price", "discountPrice", "stock"];
    let newValue;
    if (numericFields.includes(field)) {
      newValue = rawValue === "" ? "" : Number(rawValue);
    } else {
      newValue = rawValue;
    }

    if (typeof updateWeightOption === "function") {
      updateWeightOption(_id, field, newValue);
    } else if (typeof setWeightOptions === "function") {
      setWeightOptions((prev) =>
        prev.map((opt) => (_id === opt._id ? { ...opt, [field]: newValue } : opt))
      );
    }
  };

  const removeWeight = (_id) => {
    if (typeof removeWeightOption === "function") {
      removeWeightOption(_id);
    } else if (typeof setWeightOptions === "function") {
      setWeightOptions((prev) => prev.filter((opt) => opt._id !== _id));
    }
  };

  const addWeight = () => {
    if (typeof addWeightOption === "function") {
      addWeightOption();
    } else if (typeof setWeightOptions === "function") {
      const newItem = {
        _id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
        weight: "",
        unit: "",
        price: "",
        discountPrice: "",
        stock: "",
      };
      setWeightOptions((prev) => [...prev, newItem]);
    }
  };

  return (
    <div className="p-5 mt-8 relative border rounded-xl bg-white mx-5">
      <h2 className="text-base font-medium border-b pb-5 flex items-center">
        <ChevronDown className="mr-2 size-4" /> Weight Options
      </h2>

      <div className="mt-5 space-y-3">
        {weightOptions.map((opt) => (
          <div key={opt._id} className="flex gap-3 items-center">
            {/* Weight */}
            <input
              type="number"
              placeholder="Weight"
              value={opt.weight === undefined || opt.weight === null ? "" : opt.weight}
              onChange={(e) => updateWeight(opt._id, "weight", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Unit */}
            <select
              value={opt.unit || ""}
              onChange={(e) => updateWeight(opt._id, "unit", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            >
              <option value="">Select unit</option>
              {unitList.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>

            {/* Selling Price */}
            <input
              type="number"
              placeholder="Selling Price"
              value={opt.price === undefined || opt.price === null ? "" : opt.price}
              onChange={(e) => updateWeight(opt._id, "price", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Actual Price */}
            <input
              type="number"
              placeholder="Actual Price"
              value={opt.discountPrice === undefined || opt.discountPrice === null ? "" : opt.discountPrice}
              onChange={(e) => updateWeight(opt._id, "discountPrice", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Stock */}
            <input
              type="number"
              placeholder="Stock"
              value={opt.stock === undefined || opt.stock === null ? "" : opt.stock}
              onChange={(e) => updateWeight(opt._id, "stock", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeWeight(opt._id)}
              className="px-3 py-2 bg-red-500 text-white rounded-md"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Button */}
        <button
          type="button"
          onClick={addWeight}
          className="mt-2 px-4 py-2 hover:bg-[#2a0e05] hover:text-[#fdc700] bg-[#fdc700] text-[#2a0e05] rounded-md"
        >
          Add Weight Option
        </button>
      </div>
    </div>
  );
};

export default WeightShippings;
