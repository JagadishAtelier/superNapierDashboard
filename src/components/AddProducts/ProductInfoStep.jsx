import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAllCategories } from "../../api/categoryApi";
import CreateCategoryModal from "../molecules/CreateCategoryModal";
import axios from "axios";

const LANGUAGES = [
  { code: "en", label: "English", apiCode: "en-t-i0-und" },
  { code: "ta", label: "Tamil", apiCode: "ta-t-i0-und" },
  { code: "hi", label: "Hindi", apiCode: "hi-t-i0-und" },
  { code: "te", label: "Telugu", apiCode: "te-t-i0-und" },
  { code: "kn", label: "Kannada", apiCode: "kn-t-i0-und" },
  { code: "ml", label: "Malayalam", apiCode: "ml-t-i0-und" },
];

const ProductInfoStep = ({
  productId,
  setProductId,
  productName,
  setProductName,
  tamilName,
  setTamilName,
  hindiName,
  setHindiName,
  teluguName,
  setTeluguName,
  kannadaName,
  setKannadaName,
  malayalamName,
  setMalayalamName,
  category,
  setCategory,
}) => {
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const abortControllerRef = useRef(null);
  const cache = useRef({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  // ================= TRANSLITERATION =================
  const fetchTransliteration = async (text, targetLang) => {
    if (!text.trim()) return "";
    const cacheKey = `${text}_${targetLang}`;
    if (cache.current[cacheKey]) return cache.current[cacheKey];

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${targetLang}&num=1`;

    try {
      const response = await axios.get(url, {
        signal: abortControllerRef.current?.signal,
      });
      const result = response.data[1][0][1][0];
      cache.current[cacheKey] = result;
      return result;
    } catch {
      return text;
    }
  };

  const handleInputChange = async (langCode, value) => {
    // 1. Update the specific field immediately
    if (langCode === "en") setProductName(value);
    else if (langCode === "ta") setTamilName(value);
    else if (langCode === "hi") setHindiName(value);
    else if (langCode === "te") setTeluguName(value);
    else if (langCode === "kn") setKannadaName(value);
    else if (langCode === "ml") setMalayalamName(value);

    // 2. Only auto-transliterate if changing English
    if (langCode !== "en") return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (!value.trim()) {
      setTamilName("");
      setHindiName("");
      setTeluguName("");
      setKannadaName("");
      setMalayalamName("");
      return;
    }

    setIsSyncing(true);
    const tasks = LANGUAGES.filter((l) => l.code !== "en").map(async (lang) => {
      const result = await fetchTransliteration(value, lang.apiCode);
      return { code: lang.code, value: result };
    });

    const results = await Promise.all(tasks);
    results.forEach((r) => {
      if (r.code === "ta") setTamilName(r.value);
      if (r.code === "hi") setHindiName(r.value);
      if (r.code === "te") setTeluguName(r.value);
      if (r.code === "kn") setKannadaName(r.value);
      if (r.code === "ml") setMalayalamName(r.value);
    });
    setIsSyncing(false);
  };

  // ================= CATEGORY =================
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "add-new") setShowCreateModal(true);
    else setCategory(value);
  };

  const handleCreateCategory = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    setCategory(newCategory._id);
    setShowCreateModal(false);
  };

  const getFieldValue = (code) => {
      if (code === 'en') return productName;
      if (code === 'ta') return tamilName;
      if (code === 'hi') return hindiName;
      if (code === 'te') return teluguName;
      if (code === 'kn') return kannadaName;
      if (code === 'ml') return malayalamName;
      return "";
  };

  return (
    <div className="relative p-5 mt-8">
      <div className="rounded-lg border p-5 relative z-10 bg-white">
        {/* Product ID */}
        <div className="flex flex-col xl:flex-row items-start mb-6">
          <div className="w-full xl:w-64 xl:mr-10">
            <label className="font-medium flex items-center">
              Product ID
              <span className="ml-3 text-xs text-red-600 border px-2 py-0.5 rounded bg-red-50 border-red-200">
                Required
              </span>
            </label>
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-10 w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col xl:flex-row items-start mb-6">
          <div className="w-full xl:w-64 xl:mr-10">
            <label className="font-medium flex items-center">
              Category
              <span className="ml-3 text-xs text-red-600 border px-2 py-0.5 rounded bg-red-50 border-red-200">
                Required
              </span>
            </label>
          </div>
          <div className="flex-1 w-full relative">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="h-10 w-full rounded-md border px-3 py-2 pr-8"
            >
              <option value="">Select a Category</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name.en || "Unnamed"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-language Product Name Inputs */}
        {isSyncing && <p className="text-blue-500 text-sm mb-2">Syncing translations...</p>}
        <div className="flex flex-col xl:flex-row items-start mb-6">
          <div className="w-full xl:w-64 xl:mr-10">
            <label className="font-medium flex items-center">
              Product Name
              <span className="ml-3 text-xs text-red-600 border px-2 py-0.5 rounded bg-red-50 border-red-200">
                Required
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {LANGUAGES.map((lang) => {
              const isEnglish = lang.code === "en";
              const value = getFieldValue(lang.code);
              return (
                <div key={lang.code}>
                  <label className="text-sm font-semibold">{lang.label}</label>
                  <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => handleInputChange(lang.code, e.target.value)}
                    placeholder={`Type ${lang.label}`}
                    disabled={!isEnglish && !productName}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      !isEnglish && !productName
                        ? "bg-gray-100 cursor-not-allowed"
                        : "focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateCategoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCategory}
      />
    </div>
  );
};

export default ProductInfoStep;