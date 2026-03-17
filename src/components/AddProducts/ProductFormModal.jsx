// ProductFormModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { uploadToCloudinary } from "../../api/imageUpload.js";
import { createProduct } from "../../api/productApi.js";

import ProductPhotoUpload from "./ProductPhotoUpload";
import ProductInfoStep from "./ProductInfoStep";
import ProductDetailStep from "./ProductDetailStep";
import ProductManagement from "./ProductManagementStep.jsx";
import WeightShippings from "./WeightShippings.jsx";

const steps = [
  "Product Photo",
  "Product Info",
  "Product Details",
  "Product Management",
  "Weight & Shipping",
];

const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const ProductFormModal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form States
  const [productPhotos, setProductPhotos] = useState([]);
  const [productInfo, setProductInfo] = useState({
    productId: "", // can be supplied, otherwise generated on submit
    productName: "",
    tamilName: "",
    category: "",
  });
  const [productDetails, setProductDetails] = useState({
    description: "",
    tamilDescription: "",
    videoUrl: "",
    cutType: [],
    flavor: [],
    shelfLife: "",
    storageInstructions: "",
  });

  // keep frontend _id for UI only; we will omit invalid _id on submit
  const [weightOptions, setWeightOptions] = useState([
    { _id: Date.now().toString(), weight: "", unit: "", price: "", discountPrice: "", stock: "" },
  ]);

  const [productManagementData, setProductManagementData] = useState({
    isActive: false,
    sku: "",
  });

  const [weightShippingData, setWeightShippingData] = useState({
    unit: "kg",
    dimensions: { width: "", height: "", length: "" },
    weight: "",
  });

  // Handlers
  const handleProductPhotosChange = (images) => setProductPhotos(images);
  const handleProductInfoChange = ({ target: { name, value } }) =>
    setProductInfo((prev) => ({ ...prev, [name]: value }));

  const handleProductDetailChange = ({ target: { name, value } }) =>
    setProductDetails((prev) => ({ ...prev, [name]: value }));

  const handleProductManagementChange = (data) =>
    setProductManagementData(data);

  // Weight option handlers (use _id consistently on frontend)
  const addWeightOption = () =>
    setWeightOptions((prev) => [
      ...prev,
      {
        _id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(), // frontend id only
        weight: "",
        unit: "",
        price: "",
        discountPrice: "",
        stock: "",
      },
    ]);

  const updateWeightOption = (id, field, value) =>
    setWeightOptions((prev) =>
      prev.map((opt) => (opt._id === id ? { ...opt, [field]: value } : opt))
    );

  const removeWeightOption = (id) =>
    setWeightOptions((prev) => prev.filter((opt) => opt._id !== id));

  // Step Navigation
  const nextStep = () => {
    if (currentStep === 0 && !productPhotos?.length) {
      toast.error("Upload at least one product photo.");
      return;
    }
    if (currentStep === 1 && (!productInfo.productName || !productInfo.category)) {
      toast.error("Product name and category are required.");
      return;
    }
    if (currentStep === 2 && !productDetails.description) {
      toast.error("Description is required.");
      return;
    }
    if (currentStep === 3 && !productManagementData.sku) {
      toast.error("SKU is required.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Final Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Decide productId locally (avoid relying on setState before using value)
      const finalProductId = productInfo.productId && productInfo.productId.trim() ? productInfo.productId : uuidv4();

      // upload images
      const uploadedPhotoUrls = await Promise.all(
        productPhotos.map((file) => uploadToCloudinary(file))
      );

      // Build weightOptions payload:
      // - If frontend _id is a valid Mongo ObjectId, include it (useful for updates).
      // - If not valid (frontend-generated), omit _id so backend can create IDs.
      const payloadWeightOptions = weightOptions.map((w) => {
        const item = {
          weight: w.weight === "" || w.weight === null ? 0 : Number(w.weight),
          unit: w.unit || "",
          price: w.price === "" || w.price === null ? 0 : Number(w.price),
          discountPrice: w.discountPrice === "" || w.discountPrice === null ? 0 : Number(w.discountPrice),
          stock: w.stock === "" || w.stock === null ? 0 : Number(w.stock),
        };
        if (isValidObjectId(w._id)) {
          item._id = w._id;
        }
        return item;
      });

      const finalData = {
        productId: finalProductId,
        images: uploadedPhotoUrls,
        name: productInfo.productName,
        tamilName: productInfo.tamilName,
        category: productInfo.category,
        productVideoUrl: productDetails.videoUrl,
        description: productDetails.description,
        tamilDescription: productDetails.tamilDescription,
        cutType: Array.isArray(productDetails.cutType) ? productDetails.cutType : [],
        flavor: productDetails.flavor,
        shelfLife: productDetails.shelfLife,
        storageInstructions: productDetails.storageInstructions,
        unit: weightShippingData.unit,
        weightOptions: payloadWeightOptions,
        SKU: productManagementData.sku,
        status: productManagementData.isActive ? "Active" : "Inactive",
      };

      await createProduct(finalData);
      toast.success("Product created successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      // show backend message if available
      const msg = error?.response?.data?.message || "Failed to submit product. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Product</h1>

      <div className="mb-6 text-center font-medium text-[#fdc700]">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </div>

      {currentStep === 0 && <ProductPhotoUpload onImagesChange={handleProductPhotosChange} />}
      {currentStep === 1 && (
        <ProductInfoStep
          productId={productInfo.productId}
          setProductId={(val) => setProductInfo((prev) => ({ ...prev, productId: val }))}
          productName={productInfo.productName}
          setProductName={(val) => setProductInfo((prev) => ({ ...prev, productName: val }))}
          tamilName={productInfo.tamilName}
          setTamilName={(val) => setProductInfo((prev) => ({ ...prev, tamilName: val }))}
          category={productInfo.category}
          setCategory={(val) => setProductInfo((prev) => ({ ...prev, category: val }))}
        />
      )}

      {currentStep === 2 && (
        <ProductDetailStep
          description={productDetails.description}
          setDescription={(val) => setProductDetails((prev) => ({ ...prev, description: val }))}
          tamilDescription={productDetails.tamilDescription}
          setTamilDescription={(val) => setProductDetails((prev) => ({ ...prev, tamilDescription: val }))}
          videoUrl={productDetails.videoUrl}
          setVideoUrl={(val) => setProductDetails((prev) => ({ ...prev, videoUrl: val }))}
          cutType={productDetails.cutType}
          setCutType={(val) =>
            setProductDetails((prev) => ({ ...prev, cutType: Array.isArray(val) ? val : [] }))
          }
          flavor={productDetails.flavor}
          setFlavor={(val) =>
            setProductDetails((prev) => ({ ...prev, flavor: val }))
          }
          shelfLife={productDetails.shelfLife}
          setShelfLife={(val) => setProductDetails((prev) => ({ ...prev, shelfLife: val }))}
          storageInstructions={productDetails.storageInstructions}
          setStorageInstructions={(val) => setProductDetails((prev) => ({ ...prev, storageInstructions: val }))}
        />
      )}

      {currentStep === 3 && <ProductManagement onChange={handleProductManagementChange} />}

      {currentStep === 4 && (
        <WeightShippings
          weightOptions={weightOptions}
          setWeightOptions={setWeightOptions}
          addWeightOption={addWeightOption}
          updateWeightOption={updateWeightOption}
          removeWeightOption={removeWeightOption}
          units={["g", "kg", "piece",]} // modify to your allowed units
        />
      )}

      <div className="flex justify-between mt-10 p-4 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-semibold ${currentStep === 0
            ? "bg-gray-200 text-gray-500"
            : "bg-[#2a0e05] text-[#fdc700] hover:bg-[#fdc700] hover:text-[#2a0e05]"
            }`}
        >
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded-lg font-semibold bg-[#2a0e05] text-[#fdc700] hover:bg-[#fdc700] hover:text-[#2a0e05]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-[#2a0e05] text-[#fdc700] hover:bg-[#fdc700] hover:text-[#2a0e05]"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFormModal;
