import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Lightbulb, Image, X, ChevronDown, ArrowLeft } from "lucide-react";
import { createCategory, updateCategory, getCategoryById } from "../api/categoryApi"; // ✅ ADD THIS
import { uploadToCloudinary } from "../api/imageUpload"; // ✅ adjust path
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
const LANGUAGES = [
    { code: "en", label: "English", apiCode: "en-t-i0-und" },
    { code: "ta", label: "Tamil", apiCode: "ta-t-i0-und" },
    { code: "hi", label: "Hindi", apiCode: "hi-t-i0-und" },
    { code: "te", label: "Telugu", apiCode: "te-t-i0-und" },
    { code: "kn", label: "Kannada", apiCode: "kn-t-i0-und" },
    { code: "ml", label: "Malayalam", apiCode: "ml-t-i0-und" },
];

const CategoryForm = () => {
    const [formData, setFormData] = useState({
        en: "",
        ta: "",
        hi: "",
        te: "",
        kn: "",
        ml: "",
    });
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditMode = !!id;
    const categoryData = location.state?.category;

    const [isSyncing, setIsSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const abortControllerRef = useRef(null);
    const cache = useRef({});

    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const loadCategory = async () => {
            if (isEditMode) {
                let currentCat = categoryData;
                if (!currentCat) {
                    try {
                        setLoadingCategory(true);
                        currentCat = await getCategoryById(id);
                    } catch (error) {
                        console.error("Failed to fetch category by id:", error);
                        toast.error("Failed to load category data");
                        navigate("/categories");
                        return;
                    } finally {
                        setLoadingCategory(false);
                    }
                }

                if (currentCat) {
                    setFormData({
                        en: currentCat.name?.en || "",
                        ta: currentCat.name?.ta || "",
                        hi: currentCat.name?.hi || "",
                        te: currentCat.name?.te || "",
                        kn: currentCat.name?.kn || "",
                        ml: currentCat.name?.ml || "",
                    });

                    if (currentCat.image) {
                        const formattedImages = (Array.isArray(currentCat.image) ? currentCat.image : [currentCat.image]).map((url) => ({
                            preview: url,
                            file: null
                        }));
                        setImages(formattedImages);
                    }
                }
            }
        };

        loadCategory();
    }, [id, isEditMode, categoryData, navigate]);

    // ================= TRANSLITERATION =================
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
        setFormData((prev) => ({ ...prev, [langCode]: value }));

        if (langCode !== "en") return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        if (!value.trim()) {
            setFormData({
                en: "",
                ta: "",
                hi: "",
                te: "",
                kn: "",
                ml: "",
            });
            return;
        }

        setIsSyncing(true);

        const tasks = LANGUAGES.filter((l) => l.code !== "en").map(
            async (lang) => {
                const result = await fetchTransliteration(value, lang.apiCode);
                return { code: lang.code, value: result };
            }
        );

        const results = await Promise.all(tasks);

        setFormData((prev) => {
            const updated = { ...prev };
            results.forEach((r) => {
                updated[r.code] = r.value;
            });
            return updated;
        });

        setIsSyncing(false);
    };

    // ================= IMAGE UPLOAD =================
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);

        const previews = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        const newImages = [...images, ...previews].slice(0, 5);
        setImages(newImages);
    };

    const removeImage = (index) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    // ================= SUBMIT FUNCTION (ONLY ADDITION) =================
const handleSubmit = async () => {
    try {
        if (!formData.en.trim()) {
            toast.error("English name is required");
            return;
        }

        setLoading(true);

        const uploadedImages = [];

        for (let img of images) {
            if (img.file) {
                const url = await uploadToCloudinary(img.file, "categories");
                uploadedImages.push(url);
            } else {
                uploadedImages.push(img.preview);
            }
        }

        const payload = {
            name: formData,
            image: uploadedImages,
        };

        if (isEditMode) {
            const categoryId = id || categoryData?._id;

            const promise = updateCategory(categoryId, payload);

            toast.promise(promise, {
                loading: "Updating category...",
                success: "Category updated successfully ✅",
                error: "Failed to update category ❌",
            });

            await promise;

        } else {
            const promise = createCategory(payload);

            toast.promise(promise, {
                loading: "Creating category...",
                success: "Category created successfully ✅",
                error: "Failed to create category ❌",
            });

            await promise;

            // reset only for create
            setFormData({
                en: "",
                ta: "",
                hi: "",
                te: "",
                kn: "",
                ml: "",
            });
            setImages([]);
        }

        // ✅ Redirect after success
        navigate("/categories");

    } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
    } finally {
        setLoading(false);
    }
};

    // ================= UI =================
    if (loadingCategory) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600 font-medium">Loading category...</span>
            </div>
        );
    }

    return (
        <div className="p-5 bg-white space-y-5 max-w-6xl mx-auto shadow-lg rounded-lg">

            <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-black" />
                </button>
                <h2 className="text-2xl font-bold"> {isEditMode ? "Update Category" : "Add Category"}</h2>
            </div>

            <div>

                {isSyncing && (
                    <p className="text-blue-500 text-sm mb-2">Syncing...</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LANGUAGES.map((lang) => {
                        const isEnglish = lang.code === "en";

                        return (
                            <div key={lang.code}>
                                <label className="text-sm font-semibold">
                                    {lang.label}
                                </label>

                                <input
                                    type="text"
                                    value={formData[lang.code]}
                                    onChange={(e) =>
                                        handleInputChange(lang.code, e.target.value)
                                    }
                                    placeholder={`Type ${lang.label}`}
                                    disabled={!isEnglish && !formData.en}
                                    className={`w-full px-4 py-2 border rounded-lg ${!isEnglish && !formData.en
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "focus:ring-2 focus:ring-blue-500"
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* IMAGE UI SAME */}
            <div>
                <div className="flex items-center border-b pb-5 text-base font-medium">
                    Upload Category Images
                </div>

                <div className="mt-5">
                    <div className="mb-5 flex items-center text-sm text-gray-700">
                        <Lightbulb className="text-yellow-500 h-5 w-5" />
                        <div className="ml-2">
                            Upload high quality images for better visibility
                        </div>
                    </div>

                    <div className="rounded-xl border-2 border-dashed pt-4 pb-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative h-28 rounded-xl shadow">
                                    <img
                                        src={img.preview}
                                        alt="preview"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-[-5px] right-[-5px] bg-red-600 text-white rounded-full p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div
                            className="mt-6 flex justify-center items-center gap-2 cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Image className="size-4 text-indigo-500" />
                            <span className="text-indigo-600 font-medium">
                                Upload a file
                            </span>
                        </div>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFilesChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-end">
                <button
                    onClick={handleSubmit} // ✅ ONLY CHANGE HERE
                    className="w-fit bg-green-600 text-white p-2 rounded hover:bg-green-700"
                    disabled={loading}
                >
                      {loading
    ? "Uploading..."
    : isEditMode
    ? "Update Category"
    : "Create Category"}
                </button>
            </div>
        </div>
    );
};

export default CategoryForm;