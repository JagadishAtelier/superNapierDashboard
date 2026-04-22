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
    <div className="space-y-6">
      {/* 🚢 Regional Shipping Fees */}
      <div className="p-5 border rounded-xl bg-gray-50 mx-5 space-y-4">
        <h2 className="text-base font-bold flex items-center text-[#1B5E20]">
          <ChevronDown className="mr-2 size-4" /> Regional Shipping Fees (Product Level)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tamil Nadu Section */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-green-100">
            <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider">Tamil Nadu</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Normal Delivery (₹)</label>
                <input
                  type="number"
                  value={shippingData.shippingNormalTN || ""}
                  onChange={(e) => updateShipping("shippingNormalTN", e.target.value)}
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Express Delivery (₹)</label>
                <input
                  type="number"
                  value={shippingData.shippingExpressTN || ""}
                  onChange={(e) => updateShipping("shippingExpressTN", e.target.value)}
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Outside TN Section */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-orange-100">
            <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wider">Outside Tamil Nadu</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Normal Delivery (₹)</label>
                <input
                  type="number"
                  value={shippingData.shippingNormalOutside || ""}
                  onChange={(e) => updateShipping("shippingNormalOutside", e.target.value)}
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Express Delivery (₹)</label>
                <input
                  type="number"
                  value={shippingData.shippingExpressOutside || ""}
                  onChange={(e) => updateShipping("shippingExpressOutside", e.target.value)}
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isExpressOnly"
            checked={shippingData.isExpressOnly || false}
            onChange={(e) => updateShipping("isExpressOnly", e.target.checked)}
            className="w-4 h-4 text-green-600 rounded"
          />
          <label htmlFor="isExpressOnly" className="text-sm font-medium text-gray-700">
            Apply <strong>Express Delivery Only</strong> for this product
          </label>
        </div>
      </div>

      {/* ⚖️ Weight Options */}
      <div className="p-5 relative border rounded-xl bg-white mx-5">
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
