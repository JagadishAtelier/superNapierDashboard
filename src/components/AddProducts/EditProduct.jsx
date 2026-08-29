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
import MarketingStep from "./MarketingStep";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
const [saving, setSaving] = useState(false);
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
    condition: "",
    description: "",       // English
    tamilDescription: "",  // Tamil
    hindiDescription: "",  // Hindi
    teluguDescription: "", // Telugu
    kannadaDescription: "",// Kannada
    malayalamDescription: "", // Malayalam
    productVideoUrl: { en: "", ta: "", hi: "", te: "", kn: "", ml: "" },
    howToPlantVideoUrl: { en: "", ta: "", hi: "", te: "", kn: "", ml: "" },
    cutType: "",
    flavor: [],
    shelfLife: "",
    storageInstructions: "",
    certifications: []
  });
  const [variants, setVariants] = useState([]);
  const [weightOptions, setWeightOptions] = useState([]);
  const [productManagementData, setProductManagementData] = useState({ isActive: false, stock: "", sku: "", price: "" });
  const [weightShippingData, setWeightShippingData] = useState({
    shippingNormalTN: 0,
    shippingExpressTN: 0,
    shippingNormalOutside: 0,
    shippingExpressOutside: 0,
    isExpressOnly: false
  });
  const [marketingData, setMarketingData] = useState({
    highlights: [],
    howToUse: []
  });
  const [units, setUnits] = useState([]); // units from backend e.g. ["g","kg","piece"] or [{value,label},...]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard units fallback
    setUnits(["g", "kg", "piece", "pack"]);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(productId);

        setProductPhotos(data.images || []);

        setProductInfo({
          productId: data.productId || "",
          productName: data.name?.en || "",
          tamilName: data.name?.ta || "",
          hindiName: data.name?.hi || "",
          teluguName: data.name?.te || "",
          kannadaName: data.name?.kn || "",
          malayalamName: data.name?.ml || "",
          category: data.category || "",
        });

        setProductDetails({
          condition: data.condition || "",
          description: data.description?.en || "",
          tamilDescription: data.description?.ta || "",
          hindiDescription: data.description?.hi || "",
          teluguDescription: data.description?.te || "",
          kannadaDescription: data.description?.kn || "",
          malayalamDescription: data.description?.ml || "",
          productVideoUrl: (() => {
            const val = data.productVideoUrl;
            if (typeof val === "string") return { en: val, ta: "", hi: "", te: "", kn: "", ml: "" };
            return {
              en: val?.en || "",
              ta: val?.ta || "",
              hi: val?.hi || "",
              te: val?.te || "",
              kn: val?.kn || "",
              ml: val?.ml || "",
            };
          })(),
          howToPlantVideoUrl: (() => {
            const val = data.howToPlantVideoUrl;
            if (typeof val === "string") return { en: val, ta: "", hi: "", te: "", kn: "", ml: "" };
            return {
              en: val?.en || "",
              ta: val?.ta || "",
              hi: val?.hi || "",
              te: val?.te || "",
              kn: val?.kn || "",
              ml: val?.ml || "",
            };
          })(),
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
          shippingNormalTN: data.shippingNormalTN || 0,
          shippingExpressTN: data.shippingExpressTN || 0,
          shippingNormalOutside: data.shippingNormalOutside || 0,
          shippingExpressOutside: data.shippingExpressOutside || 0,
          isExpressOnly: !!data.isExpressOnly,
        });

        const normalizedHighlights = (data.statisticalHighlights || []).map(h => ({
          title: typeof h.title === 'object' && h.title !== null ? {
            en: h.title.en || "",
            ta: h.title.ta || "",
            hi: h.title.hi || "",
            te: h.title.te || "",
            kn: h.title.kn || "",
            ml: h.title.ml || "",
          } : { en: h.title || "", ta: "", hi: "", te: "", kn: "", ml: "" },
          description: typeof h.description === 'object' && h.description !== null ? {
            en: h.description.en || "",
            ta: h.description.ta || "",
            hi: h.description.hi || "",
            te: h.description.te || "",
            kn: h.description.kn || "",
            ml: h.description.ml || "",
          } : { en: h.description || "", ta: "", hi: "", te: "", kn: "", ml: "" },
          image: h.image || "",
          _id: h._id
        }));

        const normalizedHowToUse = (data.howToUseSteps || []).map(s => {
          let bullets = s.bullets;
          if (Array.isArray(bullets)) {
            bullets = {
              en: bullets,
              ta: [''], hi: [''], te: [''], kn: [''], ml: ['']
            };
          } else if (!bullets) {
            bullets = {
              en: [''], ta: [''], hi: [''], te: [''], kn: [''], ml: ['']
            };
          } else {
            bullets = {
              en: Array.isArray(bullets.en) ? bullets.en : [''],
              ta: Array.isArray(bullets.ta) ? bullets.ta : [''],
              hi: Array.isArray(bullets.hi) ? bullets.hi : [''],
              te: Array.isArray(bullets.te) ? bullets.te : [''],
              kn: Array.isArray(bullets.kn) ? bullets.kn : [''],
              ml: Array.isArray(bullets.ml) ? bullets.ml : [''],
            };
          }
          return {
            title: typeof s.title === 'object' && s.title !== null ? {
              en: s.title.en || "",
              ta: s.title.ta || "",
              hi: s.title.hi || "",
              te: s.title.te || "",
              kn: s.title.kn || "",
              ml: s.title.ml || "",
            } : { en: s.title || "", ta: "", hi: "", te: "", kn: "", ml: "" },
            heading: typeof s.heading === 'object' && s.heading !== null ? {
              en: s.heading.en || "",
              ta: s.heading.ta || "",
              hi: s.heading.hi || "",
              te: s.heading.te || "",
              kn: s.heading.kn || "",
              ml: s.heading.ml || "",
            } : { en: s.heading || "", ta: "", hi: "", te: "", kn: "", ml: "" },
            description: typeof s.description === 'object' && s.description !== null ? {
              en: s.description.en || "",
              ta: s.description.ta || "",
              hi: s.description.hi || "",
              te: s.description.te || "",
              kn: s.description.kn || "",
              ml: s.description.ml || "",
            } : { en: s.description || "", ta: "", hi: "", te: "", kn: "", ml: "" },
            image: s.image || "",
            bullets: bullets,
            _id: s._id
          };
        });

        setMarketingData({
          youtubeVideoId: data.youtubeVideoId || "",
          highlights: normalizedHighlights,
          howToUse: normalizedHowToUse
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
  setSaving(true); // start saving
  try {
    const uploadedPhotoUrls = await Promise.all(
      productPhotos.map(async (img) => {
        if (typeof img === "string") return img;
        if (img instanceof File) return await uploadToCloudinary(img);
        return null;
      })
    );

    const payload = {
      productId: productInfo.productId,
      images: uploadedPhotoUrls,
      name: {
        en: productInfo.productName,
        ta: productInfo.tamilName,
        hi: productInfo.hindiName,
        te: productInfo.teluguName,
        kn: productInfo.kannadaName,
        ml: productInfo.malayalamName,
      },
      category: productInfo.category,
      condition: productDetails.condition,
      description: {
        en: productDetails.description,
        ta: productDetails.tamilDescription,
        hi: productDetails.hindiDescription,
        te: productDetails.teluguDescription,
        kn: productDetails.kannadaDescription,
        ml: productDetails.malayalamDescription,
      },
      productVideoUrl: productDetails.productVideoUrl,
      howToPlantVideoUrl: productDetails.howToPlantVideoUrl,
      cutType: productDetails.cutType,
      flavor: productDetails.flavor,
      shelfLife: productDetails.shelfLife,
      storageInstructions: productDetails.storageInstructions,
      certifications: productDetails.certifications,
      SKU: productManagementData.sku,
      status: productManagementData.isActive ? "Active" : "Inactive",
      stock: Number(productManagementData.stock),
      price: Number(productManagementData.price),
      variants: variants.map(v => ({
        name: v.name,
        options: v.options.map(o => ({ value: o.value }))
      })),
      weightOptions: weightOptions.map(w => ({
        weight: Number(w.weight),
        unit: w.unit || weightShippingData.unit || "kg",
        price: Number(w.price),
        discountPrice: Number(w.discountPrice),
        stock: Number(w.stock),
      })),
      shippingNormalTN: Number(weightShippingData.shippingNormalTN),
      shippingExpressTN: Number(weightShippingData.shippingExpressTN),
      shippingNormalOutside: Number(weightShippingData.shippingNormalOutside),
      shippingExpressOutside: Number(weightShippingData.shippingExpressOutside),
      isExpressOnly: weightShippingData.isExpressOnly,
      youtubeVideoId: (() => {
        const url = productDetails.productVideoUrl?.en || "";
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
      })(),
      statisticalHighlights: (marketingData.highlights || []).map(h => ({
        title: typeof h.title === 'object' && h.title !== null ? h.title : { en: h.title || '', ta: '', hi: '', te: '', kn: '', ml: '' },
        description: typeof h.description === 'object' && h.description !== null ? h.description : { en: h.description || '', ta: '', hi: '', te: '', kn: '', ml: '' },
        image: h.image || ''
      })),
      howToUseSteps: (marketingData.howToUse || []).map(s => {
        let bullets = s.bullets;
        if (Array.isArray(bullets)) {
          bullets = {
            en: bullets,
            ta: [''], hi: [''], te: [''], kn: [''], ml: ['']
          };
        } else if (!bullets) {
          bullets = {
            en: [''], ta: [''], hi: [''], te: [''], kn: [''], ml: ['']
          };
        } else {
          bullets = {
            en: Array.isArray(bullets.en) ? bullets.en : [''],
            ta: Array.isArray(bullets.ta) ? bullets.ta : [''],
            hi: Array.isArray(bullets.hi) ? bullets.hi : [''],
            te: Array.isArray(bullets.te) ? bullets.te : [''],
            kn: Array.isArray(bullets.kn) ? bullets.kn : [''],
            ml: Array.isArray(bullets.ml) ? bullets.ml : [''],
          };
        }
        return {
          title: typeof s.title === 'object' && s.title !== null ? s.title : { en: s.title || '', ta: '', hi: '', te: '', kn: '', ml: '' },
          heading: typeof s.heading === 'object' && s.heading !== null ? s.heading : { en: s.heading || '', ta: '', hi: '', te: '', kn: '', ml: '' },
          description: typeof s.description === 'object' && s.description !== null ? s.description : { en: s.description || '', ta: '', hi: '', te: '', kn: '', ml: '' },
          image: s.image || '',
          bullets: bullets
        };
      }),
    };

    await updateProduct(productId, payload);
    toast.success("Product updated successfully!", { id: "product-update" });
    navigate("/products");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update product");
  } finally {
    setSaving(false); // stop saving
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

      {/* Details */}
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

        cutType={productDetails.cutType}
        setCutType={(val) => setProductDetails((prev) => ({ ...prev, cutType: val }))}

        flavor={productDetails.flavor}
        setFlavor={(val) => setProductDetails((prev) => ({ ...prev, flavor: val }))}

        shelfLife={productDetails.shelfLife}
        setShelfLife={(val) => setProductDetails((prev) => ({ ...prev, shelfLife: val }))}

        storageInstructions={productDetails.storageInstructions}
        setStorageInstructions={(val) => setProductDetails((prev) => ({ ...prev, storageInstructions: val }))}

        productVideoUrl={productDetails.productVideoUrl}
        setProductVideoUrl={(lang, val) =>
          setProductDetails((prev) => ({
            ...prev,
            productVideoUrl: { ...prev.productVideoUrl, [lang]: val },
          }))
        }
        howToPlantVideoUrl={productDetails.howToPlantVideoUrl}
        setHowToPlantVideoUrl={(lang, val) =>
          setProductDetails((prev) => ({
            ...prev,
            howToPlantVideoUrl: { ...prev.howToPlantVideoUrl, [lang]: val },
          }))
        }

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
        shippingData={weightShippingData}
        setShippingData={setWeightShippingData}
      />

      {/* Marketing & Guide */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Marketing & Documentation</h2>
        <MarketingStep
          highlights={marketingData.highlights}
          setHighlights={(val) => setMarketingData(prev => ({ ...prev, highlights: val }))}
          howToUse={marketingData.howToUse}
          setHowToUse={(val) => setMarketingData(prev => ({ ...prev, howToUse: val }))}
        />
      </div>

<div className="mt-6 flex justify-end">
  <button
    onClick={handleSubmit}
    disabled={saving} // disable while saving
    className={`px-6 py-2 rounded ${saving ? 'bg-green-400' : 'bg-green-600'} text-white`}
  >
    {saving ? "Saving..." : "Save Changes"}
  </button>
</div>
    </div>
  );
};

export default EditProduct;
