import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const LANGUAGES = [
  { code: "en", label: "English", apiCode: "en-t-i0-und" },
  { code: "ta", label: "Tamil", apiCode: "ta-t-i0-und" },
  { code: "hi", label: "Hindi", apiCode: "hi-t-i0-und" },
  { code: "te", label: "Telugu", apiCode: "te-t-i0-und" },
  { code: "kn", label: "Kannada", apiCode: "kn-t-i0-und" },
  { code: "ml", label: "Malayalam", apiCode: "ml-t-i0-und" },
];

const ProductDetailStep = ({
  description,
  setDescription,
  tamilDescription,
  setTamilDescription,
  hindiDescription,
  setHindiDescription,
  teluguDescription,
  setTeluguDescription,
  kannadaDescription,
  setKannadaDescription,
  malayalamDescription,
  setMalayalamDescription,
  videoUrl,
  setVideoUrl,
}) => {
  const [formData, setFormData] = useState({
    en: description || "",
    ta: tamilDescription || "",
    hi: hindiDescription || "",
    te: teluguDescription || "",
    kn: kannadaDescription || "",
    ml: malayalamDescription || "",
  });

  const [activeLang, setActiveLang] = useState("en");
  const [isSyncing, setIsSyncing] = useState(false);
  const abortControllerRef = useRef(null);
  const cache = useRef({});

  useEffect(() => {
    setFormData({
      en: description || "",
      ta: tamilDescription || "",
      hi: hindiDescription || "",
      te: teluguDescription || "",
      kn: kannadaDescription || "",
      ml: malayalamDescription || "",
    });
  }, [
    description,
    tamilDescription,
    hindiDescription,
    teluguDescription,
    kannadaDescription,
    malayalamDescription,
  ]);

  const fetchTransliteration = async (text, targetLang) => {
    if (!text.trim()) return "";
    const cacheKey = `${text}_${targetLang}`;
    if (cache.current[cacheKey]) return cache.current[cacheKey];

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
      text
    )}&itc=${targetLang}&num=1`;

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
    // Update local formData
    setFormData((prev) => ({ ...prev, [langCode]: value }));

    // Update parent props
    if (langCode === "en") setDescription(value);
    if (langCode === "ta") setTamilDescription(value);
    if (langCode === "hi") setHindiDescription(value);
    if (langCode === "te") setTeluguDescription(value);
    if (langCode === "kn") setKannadaDescription(value);
    if (langCode === "ml") setMalayalamDescription(value);

    // Only auto-transliterate from English
    if (langCode !== "en") return;

    // Abort previous requests
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (!value.trim()) {
      setFormData({ en: "", ta: "", hi: "", te: "", kn: "", ml: "" });
      setDescription("");
      setTamilDescription("");
      setHindiDescription("");
      setTeluguDescription("");
      setKannadaDescription("");
      setMalayalamDescription("");
      return;
    }

    setIsSyncing(true);

    const tasks = LANGUAGES.filter((l) => l.code !== "en").map(async (lang) => {
      const result = await fetchTransliteration(value, lang.apiCode);
      return { code: lang.code, value: result };
    });

    const results = await Promise.all(tasks);

    setFormData((prev) => {
        const updated = { ...prev };
        results.forEach((r) => {
            updated[r.code] = r.value;
        });
        return updated;
    });

    results.forEach((r) => {
        if (r.code === "ta") setTamilDescription(r.value);
        if (r.code === "hi") setHindiDescription(r.value);
        if (r.code === "te") setTeluguDescription(r.value);
        if (r.code === "kn") setKannadaDescription(r.value);
        if (r.code === "ml") setMalayalamDescription(r.value);
    });

    setIsSyncing(false);
  };

  return (
    <div className="relative p-5 mt-8">
      <div className="rounded-lg border p-5 relative z-10 bg-white">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Product Detail
        </div>

        {isSyncing && (
          <p className="text-blue-500 text-sm mb-2">Syncing translations...</p>
        )}

        <div className="mt-5 flex flex-col gap-5">
          {/* Language Tabs */}
          <div className="flex space-x-2 border-b mb-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`px-3 py-1 text-sm border-b-2 font-medium ${
                  activeLang === lang.code
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveLang(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Active Language Textarea */}
          <textarea
            value={formData[activeLang]}
            onChange={(e) => handleInputChange(activeLang, e.target.value)}
            rows={6}
            placeholder={`Type ${LANGUAGES.find((l) => l.code === activeLang).label} description`}
            disabled={activeLang !== "en" && !formData.en}
            className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
              activeLang !== "en" && !formData.en
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }`}
          />

          {/* Product Video */}
          <div className="flex flex-col xl:flex-row items-start mt-5">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Product Video</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input
                type="url"
                placeholder="Add YouTube video link of product"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailStep;