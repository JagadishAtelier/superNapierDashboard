// WeightShippings.jsx
import { ChevronDown } from "lucide-react";
import React from "react";

const WeightShippings = ({
  weightOptions = [],
  setWeightOptions,
  addWeightOption,
  updateWeightOption,
  removeWeightOption,
  units = [],
  shippingData = {},
  setShippingData,
}) => {
  const updateShipping = (field, value) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
  };

  // normalize units into { value, label } objects
  const unitList = Array.isArray(units)
    ? units.map((u) => (typeof u === "string" ? { value: u, label: u } : u))
    : [];

  // internal updater wrapper (keeps component flexible)
  const updateWeight = (_id, fieldOrUpdates, rawValue) => {
    const numericFields = ["weight", "price", "discountPrice", "stock"];
    let updates = {};
    if (typeof fieldOrUpdates === "object" && fieldOrUpdates !== null) {
      updates = fieldOrUpdates;
    } else {
      updates = { [fieldOrUpdates]: rawValue };
    }

    const normalizedUpdates = {};
    for (const [f, val] of Object.entries(updates)) {
      if (numericFields.includes(f)) {
        normalizedUpdates[f] = val === "" ? "" : Number(val);
      } else {
        normalizedUpdates[f] = val;
      }
    }

    if (typeof setWeightOptions === "function") {
      setWeightOptions((prev) =>
        prev.map((opt) => (_id === opt._id ? { ...opt, ...normalizedUpdates } : opt))
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

  const hasPieceUnit = weightOptions.some(opt => opt.unit === "piece");
  const colClass = hasPieceUnit ? "w-[13.5%]" : "w-1/6";

  return (
    <div className="space-y-6">
      {/* ⚖️ Weight Options */}
      <div className="p-5 relative border rounded-xl bg-white mx-5">
        <h2 className="text-base font-medium border-b pb-5 flex items-center">
          <ChevronDown className="mr-2 size-4" /> Weight Options
        </h2>

        <div className="mt-5 space-y-3">
          <div className="flex gap-3 items-center">
            <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Weight</span>
            <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Unit</span>
            {hasPieceUnit && (
              <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Per Piece Price</span>
            )}
            <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Selling Price</span>
            <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Discount Price</span>
            <span className={`${colClass} text-xs text-center font-medium text-green-600 cursor-default select-none`}>Stock</span>
            <button type="button" className={`px-3 py-2 cursor-default bg-transparent border-0 text-xs text-center select-none font-medium text-green-600 ${colClass}`}>Action</button>
          </div>
          {weightOptions.map((opt,idx) => (
            <div key={opt._id} className={`flex gap-3 items-center ${idx == 0 ? '!mt-1' : 'mt-5'}`}>
              {/* Weight */}
              <input
                type="number"
                placeholder="Weight"
                value={opt.weight === undefined || opt.weight === null ? "" : opt.weight}
                onChange={(e) => {
                  const newWeight = Number(e.target.value);
                  updateWeight(opt._id, "weight", e.target.value);
                  if (opt.unit === "piece") {
                    const oldWeight = Number(opt.weight || 0);
                    const oldPrice = Number(opt.price || 0);
                    if (oldWeight > 0 && oldPrice > 0) {
                      const ppp = oldPrice / oldWeight;
                      const computedPrice = ppp * newWeight;
                      const computedDiscountPrice = computedPrice * 1.3;
                      updateWeight(opt._id, { price: computedPrice, discountPrice: computedDiscountPrice });
                    }
                  }
                }}
                className={`h-10 rounded-md border px-3 ${colClass}`}
              />

              {/* Unit */}
              <select
                value={opt.unit || ""}
                onChange={(e) => updateWeight(opt._id, "unit", e.target.value)}
                className={`h-10 rounded-md border px-3 ${colClass}`}
              >
                <option value="">Select unit</option>
                {unitList.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>

              {/* Per Piece Price */}
              {hasPieceUnit && (
                opt.unit === "piece" ? (
                  <input
                    type="number"
                    step="any"
                    placeholder="Per Piece Price"
                    value={opt.weight && opt.price ? (Number(opt.price) / Number(opt.weight)).toFixed(4).replace(/\.?0+$/, '') : ""}
                    onChange={(e) => {
                      const ppp = Number(e.target.value);
                      const weight = Number(opt.weight || 0);
                      const computedPrice = ppp * weight;
                      const computedDiscountPrice = computedPrice * 1.3;
                      updateWeight(opt._id, { price: computedPrice, discountPrice: computedDiscountPrice });
                    }}
                    className={`h-10 rounded-md border px-3 ${colClass}`}
                  />
                ) : (
                  <div className={`${colClass}`} />
                )
              )}

              {/* Selling Price */}
              <input
                type="number"
                placeholder="Selling Price"
                value={opt.price === undefined || opt.price === null ? "" : opt.price}
                onChange={(e) => updateWeight(opt._id, "price", e.target.value)}
                className={`h-10 rounded-md border px-3 ${colClass}`}
              />

              {/* Discount Price */}
              <input
                type="number"
                placeholder="Discount Price"
                value={opt.discountPrice === undefined || opt.discountPrice === null ? "" : opt.discountPrice}
                onChange={(e) => updateWeight(opt._id, "discountPrice", e.target.value)}
                className={`h-10 rounded-md border px-3 ${colClass}`}
              />

              {/* Stock */}
              <input
                type="number"
                placeholder="Stock"
                value={opt.stock === undefined || opt.stock === null ? "" : opt.stock}
                onChange={(e) => updateWeight(opt._id, "stock", e.target.value)}
                className={`h-10 rounded-md border px-3 ${colClass}`}
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeWeight(opt._id)}
                className={`px-3 py-2 bg-red-500 text-white rounded-md ${colClass}`}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Button */}
          <button
            type="button"
            onClick={addWeight}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Add Weight Option
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightShippings;
