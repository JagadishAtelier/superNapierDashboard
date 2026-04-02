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

const LANGUAGES = ["en", "ta", "hi", "te", "kn", "ml"];

const ProductFormModal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form States
  const [productPhotos, setProductPhotos] = useState([]);
  const [productInfo, setProductInfo] = useState({
    productId: "",
    productName: "",
    tamilName: "",
    hindiName: "",
    teluguName: "",
    kannadaName: "",
    malayalamName: "",
    category: "",
  });

  const [productDetails, setProductDetails] = useState({
    description: "",
    tamilDescription: "",
    hindiDescription: "",
    teluguDescription: "",
    kannadaDescription: "",
    malayalamDescription: "",
    videoUrl: "",
    cutType: [],
    flavor: [],
    shelfLife: "",
    storageInstructions: "",
  });

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

  const addWeightOption = () =>
    setWeightOptions((prev) => [
      ...prev,
      {
        _id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
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
    if (currentStep === 1 && !productInfo.productName) {
      toast.error("Product name in English is required.");
      return;
    }
    if (currentStep === 1 && !productInfo.category) {
      toast.error("Category is required.");
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

      const finalProductId =
        productInfo.productId && productInfo.productId.trim()
          ? productInfo.productId
          : uuidv4();

      const uploadedPhotoUrls = await Promise.all(
        productPhotos.map((file) => uploadToCloudinary(file))
      );

      const payloadWeightOptions = weightOptions.map((w) => {
        const item = {
          weight: Number(w.weight) || 0,
          unit: w.unit || "",
          price: Number(w.price) || 0,
          discountPrice: Number(w.discountPrice) || 0,
          stock: Number(w.stock) || 0,
        };
        if (isValidObjectId(w._id)) item._id = w._id;
        return item;
      });

      // Build multi-language name object
      const namePayload = {
        en: productInfo.productName,
        ta: productInfo.tamilName || "",
        hi: productInfo.hindiName || "",
        te: productInfo.teluguName || "",
        kn: productInfo.kannadaName || "",
        ml: productInfo.malayalamName || "",
      };

      const descriptionPayload = {
        en: productDetails.description,
        ta: productDetails.tamilDescription || "",
        hi: productDetails.hindiDescription || "",
        te: productDetails.teluguDescription || "",
        kn: productDetails.kannadaDescription || "",
        ml: productDetails.malayalamDescription || "",
      };

      const finalData = {
        productId: finalProductId,
        images: uploadedPhotoUrls,
        name: namePayload,
        category: productInfo.category,
        productVideoUrl: productDetails.videoUrl,
        description: descriptionPayload,
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
          hindiName={productInfo.hindiName}
          setHindiName={(val) => setProductInfo((prev) => ({ ...prev, hindiName: val }))}
          teluguName={productInfo.teluguName}
          setTeluguName={(val) => setProductInfo((prev) => ({ ...prev, teluguName: val }))}
          kannadaName={productInfo.kannadaName}
          setKannadaName={(val) => setProductInfo((prev) => ({ ...prev, kannadaName: val }))}
          malayalamName={productInfo.malayalamName}
          setMalayalamName={(val) => setProductInfo((prev) => ({ ...prev, malayalamName: val }))}
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
          hindiDescription={productDetails.hindiDescription}
          setHindiDescription={(val) => setProductDetails((prev) => ({ ...prev, hindiDescription: val }))}
          teluguDescription={productDetails.teluguDescription}
          setTeluguDescription={(val) => setProductDetails((prev) => ({ ...prev, teluguDescription: val }))}
          kannadaDescription={productDetails.kannadaDescription}
          setKannadaDescription={(val) => setProductDetails((prev) => ({ ...prev, kannadaDescription: val }))}
          malayalamDescription={productDetails.malayalamDescription}
          setMalayalamDescription={(val) => setProductDetails((prev) => ({ ...prev, malayalamDescription: val }))}
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

      {currentStep === 3 && <ProductManagement onChange={setProductManagementData} />}

      {currentStep === 4 && (
        <WeightShippings
          weightOptions={weightOptions}
          setWeightOptions={setWeightOptions}
          addWeightOption={addWeightOption}
          updateWeightOption={updateWeightOption}
          removeWeightOption={removeWeightOption}
          units={["g", "kg", "piece","pack"]}
        />
      )}

      <div className="flex justify-between mt-10 p-4 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-semibold ${currentStep === 0
            ? "bg-gray-200 text-gray-500"
            : "bg-green-600 text-white"
            }`}
        >
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFormModal;