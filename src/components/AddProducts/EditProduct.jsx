import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../api/productApi";
import { uploadToCloudinary } from "../../api/imageUpload";
import { toast } from "react-hot-toast";
import ProductPhotoUpload from "./ProductPhotoUpload";
import ProductInfoStep from "./ProductInfoStep";
import ProductDetailStep from "./ProductDetailStep";
import ProductVariantStep from "./ProductVariantStep";
import ProductVariant from "./ProductVariantDetails";
import ProductManagement from "./ProductManagementStep";
import WeightShippings from "./WeightShippings";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [productPhotos, setProductPhotos] = useState([]);
  const [productInfo, setProductInfo] = useState({ productId: "", productName: "", tamilName: "", category: "" });
  const [productDetails, setProductDetails] = useState({ condition: "", description: "", tamilDescription: "", videoUrl: "", cutType: "", flavor: [], shelfLife: "", storageInstructions: "", certifications: [] });
  const [variants, setVariants] = useState([]);
  const [weightOptions, setWeightOptions] = useState([]);
  const [productManagementData, setProductManagementData] = useState({ isActive: false, stock: "", sku: "", price: "" });
  const [weightShippingData, setWeightShippingData] = useState({
    weight: "",
    unit: "", // <-- normalized to `unit`
    dimensions: { width: "", height: "", length: "" },
    dimensionsUnit: "inch",
    insurance: "optional",
    shippingService: "standard",
    preOrder: false
  });
  const [units, setUnits] = useState([]); // units from backend e.g. ["g","kg","piece"] or [{value,label},...]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/units"); // implement this endpoint to return { units: [...] }
        if (!res.ok) throw new Error("units fetch failed");
        const json = await res.json();
        setUnits(json.units || json || []);
      } catch (err) {
        console.warn("Failed to load units from backend, using fallback", err);
        setUnits(["g", "kg", "piece"]);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(productId);

        setProductPhotos(data.images || []);

        setProductInfo({
          productId: data.productId || "",
          productName: data.name || "",
          tamilName: data.tamilName || "",
          category: data.category || "",
        });

        setProductDetails({
          condition: data.condition || "",
          description: data.description || "",
          tamilDescription: data.tamilDescription || "",
          videoUrl: data.productVideoUrl || "",
          cutType: data.cutType || "",
          flavor: Array.isArray(data.flavor) ? data.flavor : [],
          shelfLife: data.shelfLife || "",
          storageInstructions: data.storageInstructions || "",
          certifications: data.certifications || [],
        });

        // group flattened variant array (same as your previous logic)
        const groupedVariants = (data.variant || []).reduce((acc, v) => {
          let found = acc.find((item) => item.name === v.name);
          if (found) found.options.push({ id: Date.now() + Math.random(), value: v.value });
          else acc.push({ id: Date.now() + Math.random(), name: v.name, options: [{ id: Date.now() + Math.random(), value: v.value }] });
          return acc;
        }, []);
        setVariants(groupedVariants);

        // Normalize weightOptions — ensure each option has _id and the expected fields
        setWeightOptions((data.weightOptions || []).map((w) => ({
          _id: w._id || (Date.now() + Math.random()).toString(),
          weight: w.weight ?? 0,
          unit: w.unit ?? "", // may be empty string if backend doesn't have it
          price: w.price ?? 0,
          discountPrice: w.discountPrice ?? 0,
          stock: w.stock ?? 0,
        })));

        setProductManagementData({
          isActive: data.status === "Active",
          sku: data.SKU || "",
          stock: data.stock ?? 0,
          price: data.price ?? 0,
        });

        setWeightShippingData({
          weight: data.shipping?.weight || "",
          unit: data.shipping?.weightUnit || "", // map shipping unit from backend if present
          dimensions: {
            width: data.shipping?.size?.width || "",
            height: data.shipping?.size?.height || "",
            length: data.shipping?.size?.length || "",
          },
          dimensionsUnit: data.shipping?.size?.unit || "inch",
          insurance: "optional",
          shippingService: "standard",
          preOrder: false,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async () => {
    try {
      const uploadedPhotoUrls = await Promise.all(
        productPhotos.map(async (img) => {
          if (typeof img === "string") return img;           // existing URL
          if (img instanceof File) return await uploadToCloudinary(img); // new file
          return null;
        })
      );

      const payload = {
        productId: productInfo.productId,
        images: uploadedPhotoUrls,
        name: productInfo.productName,
        tamilName: productInfo.tamilName,
        category: productInfo.category,
        condition: productDetails.condition,
        description: productDetails.description,
        tamilDescription: productDetails.tamilDescription,
        productVideoUrl: productDetails.videoUrl,
        cutType: productDetails.cutType,
        flavor: productDetails.flavor, 
        shelfLife: productDetails.shelfLife,
        storageInstructions: productDetails.storageInstructions,
        certifications: productDetails.certifications,
        // use first weight option unit if product-level unit not set
        unit: weightOptions[0]?.unit || weightShippingData.unit || "kg",
        weightOptions: weightOptions.map((w) => ({
          weight: Number(w.weight || 0),
          unit: w.unit || "",
          price: Number(w.price || 0),
          discountPrice: Number(w.discountPrice || 0),
          stock: Number(w.stock || 0),
        })),
        SKU: productManagementData.sku,
        status: productManagementData.isActive ? "Active" : "Inactive",
        stock: productManagementData.stock,
      };

      await updateProduct(productId, payload);
      toast.success("Product updated successfully!", { id: "product-update" });
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  if (loading) return <div className="p-4">Loading product...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded">
      <div className="flex justify-between items-center ">

        <h2 className="text-2xl font-semibold">Edit Product</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Back
        </button>
      </div>


      {/* Photos */}
      <ProductPhotoUpload initialImages={productPhotos} onImagesChange={setProductPhotos} />

      {/* Info */}
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

      {/* Details */}
      <ProductDetailStep
        description={productDetails.description}
        setDescription={(val) => setProductDetails((prev) => ({ ...prev, description: val }))}
        tamilDescription={productDetails.tamilDescription}
        setTamilDescription={(val) => setProductDetails((prev) => ({ ...prev, tamilDescription: val }))}
        cutType={productDetails.cutType}
        setCutType={(val) => setProductDetails((prev) => ({ ...prev, cutType: val }))}
        flavor={productDetails.flavor}
        setFlavor={(val) =>
          setProductDetails((prev) => ({ ...prev, flavor: val }))
        }
        shelfLife={productDetails.shelfLife}
        setShelfLife={(val) => setProductDetails((prev) => ({ ...prev, shelfLife: val }))}
        storageInstructions={productDetails.storageInstructions}
        setStorageInstructions={(val) => setProductDetails((prev) => ({ ...prev, storageInstructions: val }))}
        videoUrl={productDetails.videoUrl}
        setVideoUrl={(val) => setProductDetails((prev) => ({ ...prev, videoUrl: val }))}
        certifications={productDetails.certifications}
        addCertification={(cert) => setProductDetails((prev) => ({ ...prev, certifications: [...prev.certifications, cert] }))}
        removeCertification={(cert) => setProductDetails((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c !== cert) }))}
      />

      {/* Management */}
      <ProductManagement
        isActive={productManagementData.isActive}
        stock={productManagementData.stock}
        sku={productManagementData.sku}
        price={productManagementData.price}
        onChange={(data) => setProductManagementData(data)}
      />

      {/* Weight & Shipping */}
      <WeightShippings
        weightOptions={weightOptions}
        setWeightOptions={setWeightOptions}
        units={units}
      />

      <div className="mt-6 flex justify-end">
        <button onClick={handleSubmit} className="bg-[#2a0e05] text-[#fdc700] hover:bg-[#fdc700] hover:text-[#2a0e05] px-6 py-2 rounded">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
