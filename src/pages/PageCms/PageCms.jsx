import React, { useState, useEffect } from "react";
import { 
  getPageContent, 
  updatePageContent 
} from "../../api/pagesApi";
import { uploadToCloudinary } from "../../api/imageUpload";
import { toast } from "react-hot-toast";
import { 
  Eye, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Upload, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Info
} from "lucide-react";

export default function PageCms() {
  const [activePage, setActivePage] = useState("about"); // "about" or "partnership"
  const [activeTab, setActiveTab] = useState("content"); // "content" or "seo"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Focus Keyword for real-time SEO analysis
  const [focusKeyword, setFocusKeyword] = useState("");

  // Page contents state
  const [pageData, setPageData] = useState({
    about: null,
    partnership: null
  });

  // Fetch page content on mount and when activePage changes
  useEffect(() => {
    fetchPageData();
  }, [activePage]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const res = await getPageContent(activePage);
      if (res.data && res.data.success) {
        setPageData(prev => ({
          ...prev,
          [activePage]: res.data.page
        }));
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error(`Failed to load ${activePage} page content.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const page = pageData[activePage];
      
      // Basic JSON-LD pre-validation on frontend
      if (page.seo && page.seo.jsonLd) {
        let jsonLdObj = page.seo.jsonLd;
        if (typeof jsonLdObj === "string") {
          try {
            jsonLdObj = JSON.parse(jsonLdObj);
          } catch (e) {
            toast.error("JSON-LD is not valid JSON.");
            setSaving(false);
            return;
          }
        }
        if (jsonLdObj && (!jsonLdObj["@context"] || !jsonLdObj["@type"])) {
          toast.error("JSON-LD is missing required fields '@context' or '@type'.");
          setSaving(false);
          return;
        }
      }

      const res = await updatePageContent(activePage, {
        content: page.content,
        seo: page.seo
      });

      if (res.data && res.data.success) {
        toast.success(`${activePage === "about" ? "About Us" : "Partnership"} content updated!`);
        // Refresh local data
        setPageData(prev => ({
          ...prev,
          [activePage]: res.data.page
        }));
      }
    } catch (error) {
      console.error("Error saving page content:", error);
      toast.error(error.response?.data?.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e, sectionPath, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading image to Cloudinary...");
    try {
      const secureUrl = await uploadToCloudinary(file, `pages/${activePage}`);
      
      // Update state dynamically
      setPageData(prev => {
        const page = { ...prev[activePage] };
        
        // Find nested target
        let target = page.content;
        const paths = sectionPath.split(".");
        for (let i = 0; i < paths.length; i++) {
          if (paths[i]) {
            target = target[paths[i]];
          }
        }

        target[fieldName] = {
          url: secureUrl,
          publicId: file.name,
          alt: target[fieldName]?.alt || ""
        };

        return { ...prev, [activePage]: page };
      });

      toast.dismiss(loadingToast);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Image upload failed. Please try again.");
    }
  };

  // Text field change helpers
  const handleContentChange = (sectionPath, fieldName, value) => {
    setPageData(prev => {
      const page = { ...prev[activePage] };
      let target = page.content;
      
      if (sectionPath) {
        const paths = sectionPath.split(".");
        for (let i = 0; i < paths.length; i++) {
          if (paths[i]) {
            target = target[paths[i]];
          }
        }
      }

      target[fieldName] = value;
      return { ...prev, [activePage]: page };
    });
  };

  const handleSeoChange = (fieldName, value) => {
    setPageData(prev => {
      const page = { ...prev[activePage] };
      page.seo = {
        ...page.seo,
        [fieldName]: value
      };
      return { ...prev, [activePage]: page };
    });
  };

  // Dynamic Array Modification helpers
  const handleArrayChange = (sectionPath, index, fieldName, value) => {
    setPageData(prev => {
      const page = { ...prev[activePage] };
      let target = page.content;
      const paths = sectionPath.split(".");
      for (let i = 0; i < paths.length; i++) {
        if (paths[i]) {
          target = target[paths[i]];
        }
      }
      
      target[index][fieldName] = value;
      return { ...prev, [activePage]: page };
    });
  };

  const addArrayItem = (sectionPath, defaultObject) => {
    setPageData(prev => {
      const page = { ...prev[activePage] };
      let target = page.content;
      const paths = sectionPath.split(".");
      for (let i = 0; i < paths.length; i++) {
        if (paths[i]) {
          target = target[paths[i]];
        }
      }
      
      target.push(defaultObject);
      return { ...prev, [activePage]: page };
    });
  };

  const removeArrayItem = (sectionPath, index) => {
    setPageData(prev => {
      const page = { ...prev[activePage] };
      let target = page.content;
      const paths = sectionPath.split(".");
      for (let i = 0; i < paths.length; i++) {
        if (paths[i]) {
          target = target[paths[i]];
        }
      }
      
      target.splice(index, 1);
      return { ...prev, [activePage]: page };
    });
  };

  // SEO Checker Helpers
  const getSeoAnalysis = () => {
    const page = pageData[activePage];
    if (!page || !page.seo) return null;

    const analysis = [];
    let score = 100;

    const title = page.seo.title || "";
    const description = page.seo.description || "";
    const keywords = page.seo.keywords || [];
    const jsonLd = page.seo.jsonLd;
    const ogImage = page.seo.ogImage || "";

    // 1. Title Length
    if (title.length === 0) {
      analysis.push({ type: "error", message: "Meta Title is empty." });
      score -= 30;
    } else if (title.length < 50) {
      analysis.push({ type: "warning", message: `Meta Title is too short (${title.length} chars). Aim for 50-60.` });
      score -= 10;
    } else if (title.length > 60) {
      analysis.push({ type: "warning", message: `Meta Title is too long (${title.length} chars). Aim for 50-60.` });
      score -= 10;
    } else {
      analysis.push({ type: "success", message: `Meta Title length is optimal (${title.length} chars).` });
    }

    // 2. Description Length
    if (description.length === 0) {
      analysis.push({ type: "error", message: "Meta Description is empty." });
      score -= 30;
    } else if (description.length < 120) {
      analysis.push({ type: "warning", message: `Meta Description is too short (${description.length} chars). Aim for 120-160.` });
      score -= 10;
    } else if (description.length > 160) {
      analysis.push({ type: "warning", message: `Meta Description is too long (${description.length} chars). Aim for 120-160.` });
      score -= 10;
    } else {
      analysis.push({ type: "success", message: `Meta Description length is optimal (${description.length} chars).` });
    }

    // 3. Keyword analysis
    if (focusKeyword) {
      const keywordLower = focusKeyword.toLowerCase();
      
      // In Title
      if (title.toLowerCase().includes(keywordLower)) {
        analysis.push({ type: "success", message: `Focus keyword "${focusKeyword}" found in Meta Title.` });
      } else {
        analysis.push({ type: "warning", message: `Focus keyword "${focusKeyword}" not found in Meta Title.` });
        score -= 10;
      }

      // In Description
      if (description.toLowerCase().includes(keywordLower)) {
        analysis.push({ type: "success", message: `Focus keyword "${focusKeyword}" found in Meta Description.` });
      } else {
        analysis.push({ type: "warning", message: `Focus keyword "${focusKeyword}" not found in Meta Description.` });
        score -= 10;
      }

      // In Page Content (recursive search in content object)
      const checkInContent = (obj) => {
        if (!obj) return false;
        if (typeof obj === "string") {
          return obj.toLowerCase().includes(keywordLower);
        }
        if (Array.isArray(obj)) {
          return obj.some(checkInContent);
        }
        if (typeof obj === "object") {
          return Object.values(obj).some(checkInContent);
        }
        return false;
      };

      if (checkInContent(page.content)) {
        analysis.push({ type: "success", message: `Focus keyword "${focusKeyword}" appears naturally in page content.` });
      } else {
        analysis.push({ type: "warning", message: `Focus keyword "${focusKeyword}" not found in page content sections.` });
        score -= 5;
      }
    } else {
      analysis.push({ type: "info", message: "Enter a Focus Keyword to test its SEO density." });
    }

    // 4. OG Image Check
    if (!ogImage) {
      analysis.push({ type: "warning", message: "OpenGraph Image is missing. Social shares will display with no preview thumbnail." });
      score -= 10;
    } else {
      analysis.push({ type: "success", message: "OpenGraph Image configured." });
    }

    // 5. JSON-LD checks
    if (!jsonLd) {
      analysis.push({ type: "warning", message: "Structured Data (Schema markup) is missing." });
      score -= 15;
    } else {
      try {
        const parsed = typeof jsonLd === "string" ? JSON.parse(jsonLd) : jsonLd;
        if (parsed && parsed["@context"] && parsed["@type"]) {
          analysis.push({ type: "success", message: "Structured Data JSON-LD has valid context and schema type." });
        } else {
          analysis.push({ type: "error", message: "Structured Data is missing standard '@context' or '@type' fields." });
          score -= 10;
        }
      } catch (e) {
        analysis.push({ type: "error", message: "Structured Data has invalid JSON syntax." });
        score -= 15;
      }
    }

    return {
      score: Math.max(0, score),
      checks: analysis
    };
  };

  const currentData = pageData[activePage];
  const seoCheck = getSeoAnalysis();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-[#0a2613]" />
        <span className="ml-3 text-lg font-bold text-[#0a2613]">Loading Page CMS...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header and Page Tabs */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-[#15803d] mb-2 uppercase tracking-tight">
            Page Content CMS & SEO
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage public marketing pages copy, images, and search engine optimization elements.
          </p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => { setActivePage("about"); setActiveTab("content"); }}
            className={`rounded-xl px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
              activePage === "about"
                ? "bg-[#0a2613] text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => { setActivePage("partnership"); setActiveTab("content"); }}
            className={`rounded-xl px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
              activePage === "partnership"
                ? "bg-[#0a2613] text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Partnerships
          </button>
        </div>
      </div>

      {/* Tab Switcher (Content Editor vs SEO Settings) */}
      <div className="mb-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-bold text-sm uppercase tracking-wider transition ${
            activeTab === "content"
              ? "border-[#0a2613] text-[#0a2613]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Eye className="h-4 w-4" /> Visual Page Content
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-bold text-sm uppercase tracking-wider transition ${
            activeTab === "seo"
              ? "border-[#0a2613] text-[#0a2613]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Settings className="h-4 w-4" /> SEO Meta & Schema
        </button>
      </div>

      {/* Main CMS Editor Layout */}
      {currentData && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Editor Form Columns (takes 2 cols if Visual, or 2 cols if SEO) */}
          <div className="lg:col-span-2 space-y-8">
            
            {activeTab === "content" ? (
              // ── VISUAL CONTENT CMS EDITOR ──
              <div className="space-y-6">
                
                {/* ── ABOUT PAGE SECTIONS ── */}
                {activePage === "about" && currentData.content && (
                  <>
                    {/* Hero Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Hero Header</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Pre-Title (Tag)</label>
                          <input
                            type="text"
                            value={currentData.content.hero?.story || ""}
                            onChange={(e) => handleContentChange("hero", "story", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={currentData.content.hero?.title || ""}
                            onChange={(e) => handleContentChange("hero", "title", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subdescription</label>
                          <textarea
                            rows="2"
                            value={currentData.content.hero?.description || ""}
                            onChange={(e) => handleContentChange("hero", "description", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                          />
                        </div>
                        {/* Cloudinary Image Editor */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Hero Background Image</label>
                          <div className="flex gap-4 items-center">
                            <img
                              src={currentData.content.hero?.imageSrc?.url || "/hero-slider4.jpg"}
                              className="h-20 w-32 rounded-xl object-cover border"
                              alt="Hero thumbnail"
                            />
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "hero", "imageSrc")}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0a2613]/10 file:text-[#0a2613] hover:file:bg-[#0a2613]/20"
                              />
                              <input
                                type="text"
                                placeholder="Image ALT tag (SEO friendly)"
                                value={currentData.content.hero?.imageSrc?.alt || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPageData(prev => {
                                    const page = { ...prev.about };
                                    page.content.hero.imageSrc.alt = val;
                                    return { ...prev, about: page };
                                  });
                                }}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#0a2613]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Who We Are Story Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide font-sans">Our Story</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={currentData.content.story?.subtitle || ""}
                              onChange={(e) => handleContentChange("story", "subtitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                            <input
                              type="text"
                              value={currentData.content.story?.title || ""}
                              onChange={(e) => handleContentChange("story", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Paragraph 1</label>
                          <textarea
                            rows="3"
                            value={currentData.content.story?.description1 || ""}
                            onChange={(e) => handleContentChange("story", "description1", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Paragraph 2</label>
                          <textarea
                            rows="3"
                            value={currentData.content.story?.description2 || ""}
                            onChange={(e) => handleContentChange("story", "description2", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={currentData.content.story?.buttonText || ""}
                              onChange={(e) => handleContentChange("story", "buttonText", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button Link</label>
                            <input
                              type="text"
                              value={currentData.content.story?.buttonLink || ""}
                              onChange={(e) => handleContentChange("story", "buttonLink", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                        </div>
                        
                        {/* Cloudinary Story Image */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Story Main Image</label>
                          <div className="flex gap-4 items-center">
                            <img
                              src={currentData.content.story?.imageSrc?.url || "/napierStems.webp"}
                              className="h-20 w-32 rounded-xl object-cover border"
                              alt="Story thumbnail"
                            />
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "story", "imageSrc")}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0a2613]/10 file:text-[#0a2613] hover:file:bg-[#0a2613]/20"
                              />
                              <input
                                type="text"
                                placeholder="Image ALT tag (SEO friendly)"
                                value={currentData.content.story?.imageSrc?.alt || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPageData(prev => {
                                    const page = { ...prev.about };
                                    page.content.story.imageSrc.alt = val;
                                    return { ...prev, about: page };
                                  });
                                }}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#0a2613]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Badge label</label>
                            <input
                              type="text"
                              value={currentData.content.story?.badgeTitle || ""}
                              onChange={(e) => handleContentChange("story", "badgeTitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Badge Value</label>
                            <input
                              type="text"
                              value={currentData.content.story?.badgeValue || ""}
                              onChange={(e) => handleContentChange("story", "badgeValue", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Stats List Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Key Statistics</h3>
                        <button
                          onClick={() => addArrayItem("stats", { value: "0", label: "Stat", iconName: "Users" })}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-[#0a2613] px-3 py-1.5 rounded-full hover:bg-black"
                        >
                          <Plus className="h-3 w-3" /> Add Stat
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {currentData.content.stats?.map((stat, i) => (
                          <div key={i} className="flex gap-4 items-end bg-gray-50 p-4 rounded-2xl border">
                            <div className="w-1/4">
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Stat Value</label>
                              <input
                                type="text"
                                value={stat.value}
                                onChange={(e) => handleArrayChange("stats", i, "value", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#0a2613] bg-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Label</label>
                              <input
                                type="text"
                                value={stat.label}
                                onChange={(e) => handleArrayChange("stats", i, "label", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#0a2613] bg-white"
                              />
                            </div>
                            <div className="w-1/4">
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Icon Name</label>
                              <select
                                value={stat.iconName}
                                onChange={(e) => handleArrayChange("stats", i, "iconName", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#0a2613] bg-white"
                              >
                                <option value="Users">Users</option>
                                <option value="Award">Award</option>
                                <option value="TrendingUp">TrendingUp</option>
                                <option value="ShieldCheck">ShieldCheck</option>
                                <option value="Leaf">Leaf</option>
                                <option value="Sprout">Sprout</option>
                              </select>
                            </div>
                            <button
                              onClick={() => removeArrayItem("stats", i)}
                              className="text-red-500 hover:text-red-700 p-2 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Values List Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Core Values</h3>
                        <button
                          onClick={() => addArrayItem("values", { title: "Value", desc: "", iconName: "ShieldCheck" })}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-[#0a2613] px-3 py-1.5 rounded-full hover:bg-black"
                        >
                          <Plus className="h-3 w-3" /> Add Value
                        </button>
                      </div>

                      <div className="space-y-4">
                        {currentData.content.values?.map((val, i) => (
                          <div key={i} className="bg-gray-50 p-4 rounded-2xl border space-y-3">
                            <div className="flex gap-4 items-center">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={val.title}
                                  onChange={(e) => handleArrayChange("values", i, "title", e.target.value)}
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="w-1/4">
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Icon</label>
                                <select
                                  value={val.iconName}
                                  onChange={(e) => handleArrayChange("values", i, "iconName", e.target.value)}
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none"
                                >
                                  <option value="ShieldCheck">ShieldCheck</option>
                                  <option value="Users">Users</option>
                                  <option value="Leaf">Leaf</option>
                                  <option value="Award">Award</option>
                                </select>
                              </div>
                              <button
                                onClick={() => removeArrayItem("values", i)}
                                className="text-red-500 hover:text-red-700 p-2 mt-4"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Description</label>
                              <textarea
                                rows="2"
                                value={val.desc}
                                onChange={(e) => handleArrayChange("values", i, "desc", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Call to Action</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Tagline</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.subtitle || ""}
                              onChange={(e) => handleContentChange("cta", "subtitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.title || ""}
                              onChange={(e) => handleContentChange("cta", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                          <textarea
                            rows="2"
                            value={currentData.content.cta?.description || ""}
                            onChange={(e) => handleContentChange("cta", "description", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 1 (Primary) Text</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.button1Text || ""}
                              onChange={(e) => handleContentChange("cta", "button1Text", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 1 Link</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.button1Link || ""}
                              onChange={(e) => handleContentChange("cta", "button1Link", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 2 (Secondary) Text</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.button2Text || ""}
                              onChange={(e) => handleContentChange("cta", "button2Text", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 2 Link</label>
                            <input
                              type="text"
                              value={currentData.content.cta?.button2Link || ""}
                              onChange={(e) => handleContentChange("cta", "button2Link", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── PARTNERSHIP PAGE SECTIONS ── */}
                {activePage === "partnership" && currentData.content && (
                  <>
                    {/* Hero Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Hero Section</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={currentData.content.hero?.title || ""}
                            onChange={(e) => handleContentChange("hero", "title", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subdescription</label>
                          <textarea
                            rows="2"
                            value={currentData.content.hero?.description || ""}
                            onChange={(e) => handleContentChange("hero", "description", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 1 Label</label>
                            <input
                              type="text"
                              value={currentData.content.hero?.button1Text || ""}
                              onChange={(e) => handleContentChange("hero", "button1Text", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Button 2 Label</label>
                            <input
                              type="text"
                              value={currentData.content.hero?.button2Text || ""}
                              onChange={(e) => handleContentChange("hero", "button2Text", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                        {/* Hero Image */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Hero Right Image</label>
                          <div className="flex gap-4 items-center">
                            <img
                              src={currentData.content.hero?.imageSrc?.url || "/assets/partnership/hero.png"}
                              className="h-20 w-32 rounded-xl object-contain border bg-gray-900"
                              alt="Hero thumbnail"
                            />
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "hero", "imageSrc")}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0a2613]/10 file:text-[#0a2613]"
                              />
                              <input
                                type="text"
                                placeholder="Image ALT tag (SEO friendly)"
                                value={currentData.content.hero?.imageSrc?.alt || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPageData(prev => {
                                    const page = { ...prev.partnership };
                                    page.content.hero.imageSrc.alt = val;
                                    return { ...prev, partnership: page };
                                  });
                                }}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pillars / Foundational Choice Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Pillars Section</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
                            <input
                              type="text"
                              value={currentData.content.pillarsSection?.title || ""}
                              onChange={(e) => handleContentChange("pillarsSection", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={currentData.content.pillarsSection?.subtitle || ""}
                              onChange={(e) => handleContentChange("pillarsSection", "subtitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>

                        {/* List of 3 Pillars */}
                        <div className="space-y-4 border-t pt-4">
                          <span className="text-xs font-bold uppercase text-gray-400">Pillar Blocks (Fixed size: 3)</span>
                          {currentData.content.pillarsSection?.pillars?.map((pillar, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl border">
                              <div className="flex gap-4 mb-2">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">Pillar {i+1} Title</label>
                                  <input
                                    type="text"
                                    value={pillar.title}
                                    onChange={(e) => handleArrayChange("pillarsSection.pillars", i, "title", e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div className="w-1/4">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">Icon</label>
                                  <select
                                    value={pillar.iconName}
                                    onChange={(e) => handleArrayChange("pillarsSection.pillars", i, "iconName", e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white"
                                  >
                                    <option value="Zap">Zap (Lightning)</option>
                                    <option value="ShieldCheck">ShieldCheck</option>
                                    <option value="TrendingUp">TrendingUp</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Description</label>
                                <textarea
                                  rows="2"
                                  value={pillar.description}
                                  onChange={(e) => handleArrayChange("pillarsSection.pillars", i, "description", e.target.value)}
                                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Advantages & Stats</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                          <input
                            type="text"
                            value={currentData.content.statsSection?.title || ""}
                            onChange={(e) => handleContentChange("statsSection", "title", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                          <textarea
                            rows="2"
                            value={currentData.content.statsSection?.description || ""}
                            onChange={(e) => handleContentChange("statsSection", "description", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          />
                        </div>

                        {/* Bullet Highlights */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-gray-400">Checklist Highlights</span>
                            <button
                              onClick={() => {
                                const list = [...currentData.content.statsSection.highlights];
                                list.push("New Advantage");
                                handleContentChange("statsSection", "highlights", list);
                              }}
                              className="text-[10px] font-bold bg-gray-100 border text-gray-700 px-2 py-1 rounded"
                            >
                              + Add Highlight
                            </button>
                          </div>
                          <div className="space-y-2">
                            {currentData.content.statsSection?.highlights?.map((high, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={high}
                                  onChange={(e) => {
                                    const list = [...currentData.content.statsSection.highlights];
                                    list[i] = e.target.value;
                                    handleContentChange("statsSection", "highlights", list);
                                  }}
                                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                                />
                                <button
                                  onClick={() => {
                                    const list = [...currentData.content.statsSection.highlights];
                                    list.splice(i, 1);
                                    handleContentChange("statsSection", "highlights", list);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Numerical Stats (4 cards) */}
                        <div className="border-t pt-4 space-y-4">
                          <span className="text-xs font-bold uppercase text-gray-400 block">Numerical Stat Cards (Optimal: 4)</span>
                          {currentData.content.statsSection?.stats?.map((stat, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Label</label>
                                <input
                                  type="text"
                                  value={stat.label}
                                  onChange={(e) => handleArrayChange("statsSection.stats", i, "label", e.target.value)}
                                  className="w-full rounded-lg border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Value</label>
                                <input
                                  type="text"
                                  value={stat.value}
                                  onChange={(e) => handleArrayChange("statsSection.stats", i, "value", e.target.value)}
                                  className="w-full rounded-lg border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Suffix</label>
                                <input
                                  type="text"
                                  value={stat.suffix}
                                  onChange={(e) => handleArrayChange("statsSection.stats", i, "suffix", e.target.value)}
                                  className="w-full rounded-lg border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Color Class</label>
                                <input
                                  type="text"
                                  value={stat.color}
                                  onChange={(e) => handleArrayChange("statsSection.stats", i, "color", e.target.value)}
                                  className="w-full rounded-lg border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Applications Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Industrial Applications</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                          <input
                            type="text"
                            value={currentData.content.applicationsSection?.title || ""}
                            onChange={(e) => handleContentChange("applicationsSection", "title", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          />
                        </div>

                        {/* Image */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Section Image</label>
                          <div className="flex gap-4 items-center">
                            <img
                              src={currentData.content.applicationsSection?.imageSrc?.url || "/assets/partnership/industrial.png"}
                              className="h-20 w-32 rounded-xl object-cover border"
                              alt="Applications thumbnail"
                            />
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "applicationsSection", "imageSrc")}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Image ALT tag (SEO friendly)"
                                value={currentData.content.applicationsSection?.imageSrc?.alt || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPageData(prev => {
                                    const page = { ...prev.partnership };
                                    page.content.applicationsSection.imageSrc.alt = val;
                                    return { ...prev, partnership: page };
                                  });
                                }}
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Badge value (e.g. 95%)</label>
                            <input
                              type="text"
                              value={currentData.content.applicationsSection?.badgeValue || ""}
                              onChange={(e) => handleContentChange("applicationsSection", "badgeValue", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={currentData.content.applicationsSection?.badgeText || ""}
                              onChange={(e) => handleContentChange("applicationsSection", "badgeText", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>

                        {/* Applications items list */}
                        <div className="border-t pt-4 space-y-4">
                          <span className="text-xs font-bold uppercase text-gray-400 block">Application List Items</span>
                          {currentData.content.applicationsSection?.applications?.map((app, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl border space-y-2">
                              <div className="flex gap-4">
                                <div className="w-20">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">No.</label>
                                  <input
                                    type="text"
                                    value={app.number}
                                    onChange={(e) => handleArrayChange("applicationsSection.applications", i, "number", e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-xs bg-white text-center font-bold"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">Title</label>
                                  <input
                                    type="text"
                                    value={app.title}
                                    onChange={(e) => handleArrayChange("applicationsSection.applications", i, "title", e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-xs bg-white font-bold"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400">Description</label>
                                <textarea
                                  rows="2"
                                  value={app.description}
                                  onChange={(e) => handleArrayChange("applicationsSection.applications", i, "description", e.target.value)}
                                  className="w-full rounded border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Comparison Table Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Comparison Table</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
                            <input
                              type="text"
                              value={currentData.content.comparisonSection?.title || ""}
                              onChange={(e) => handleContentChange("comparisonSection", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={currentData.content.comparisonSection?.subtitle || ""}
                              onChange={(e) => handleContentChange("comparisonSection", "subtitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>

                        {/* Rows */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-gray-400">Table Data Rows</span>
                            <button
                              onClick={() => addArrayItem("comparisonSection.rows", { feature: "Feature Name", slips: "High", tissue: "Low", seeds: "Medium" })}
                              className="text-[10px] font-bold bg-gray-100 border text-gray-700 px-2 py-1 rounded"
                            >
                              + Add Row
                            </button>
                          </div>
                          <div className="space-y-4">
                            {currentData.content.comparisonSection?.rows?.map((row, i) => (
                              <div key={i} className="bg-gray-50 p-4 rounded-xl border space-y-2">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[9px] font-bold uppercase text-gray-400">Parameter/Feature</label>
                                    <input
                                      type="text"
                                      value={row.feature}
                                      onChange={(e) => handleArrayChange("comparisonSection.rows", i, "feature", e.target.value)}
                                      className="w-full rounded border px-2 py-1 text-xs bg-white font-bold"
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeArrayItem("comparisonSection.rows", i)}
                                    className="text-red-500 hover:text-red-700 mt-5"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[8px] font-bold uppercase text-gray-400">Slips</label>
                                    <input
                                      type="text"
                                      value={row.slips}
                                      onChange={(e) => handleArrayChange("comparisonSection.rows", i, "slips", e.target.value)}
                                      className="w-full rounded border px-2 py-0.5 text-xs bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold uppercase text-gray-400">Tissue Culture</label>
                                    <input
                                      type="text"
                                      value={row.tissue}
                                      onChange={(e) => handleArrayChange("comparisonSection.rows", i, "tissue", e.target.value)}
                                      className="w-full rounded border px-2 py-0.5 text-xs bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold uppercase text-gray-400">Seeds</label>
                                    <input
                                      type="text"
                                      value={row.seeds}
                                      onChange={(e) => handleArrayChange("comparisonSection.rows", i, "seeds", e.target.value)}
                                      className="w-full rounded border px-2 py-0.5 text-xs bg-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footnote and Button */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Footnote Legend</label>
                            <input
                              type="text"
                              value={currentData.content.comparisonSection?.footnote || ""}
                              onChange={(e) => handleContentChange("comparisonSection", "footnote", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Bottom CTA Button Text</label>
                            <input
                              type="text"
                              value={currentData.content.comparisonSection?.buttonText || ""}
                              onChange={(e) => handleContentChange("comparisonSection", "buttonText", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline / Roadmap Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Execution Timeline</h3>
                        <button
                          onClick={() => addArrayItem("timelineSection.steps", { phase: "Phase 0X", title: "New Step", duration: "TBD", details: "" })}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-[#0a2613] px-3 py-1.5 rounded-full hover:bg-black"
                        >
                          <Plus className="h-3 w-3" /> Add Step
                        </button>
                      </div>

                      <div className="space-y-4">
                        {currentData.content.timelineSection?.steps?.map((step, i) => (
                          <div key={i} className="bg-gray-50 p-4 rounded-xl border space-y-2">
                            <div className="flex gap-2 items-center">
                              <div className="w-1/4">
                                <label className="block text-[9px] font-bold uppercase text-gray-400">Phase (e.g. Phase 01)</label>
                                <input
                                  type="text"
                                  value={step.phase}
                                  onChange={(e) => handleArrayChange("timelineSection.steps", i, "phase", e.target.value)}
                                  className="w-full rounded border px-2 py-1 text-xs bg-white font-bold"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[9px] font-bold uppercase text-gray-400">Title</label>
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => handleArrayChange("timelineSection.steps", i, "title", e.target.value)}
                                  className="w-full rounded border px-2 py-1 text-xs bg-white font-bold"
                                />
                              </div>
                              <div className="w-1/4">
                                <label className="block text-[9px] font-bold uppercase text-gray-400">Duration (e.g. Week 1)</label>
                                <input
                                  type="text"
                                  value={step.duration}
                                  onChange={(e) => handleArrayChange("timelineSection.steps", i, "duration", e.target.value)}
                                  className="w-full rounded border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                              <button
                                onClick={() => removeArrayItem("timelineSection.steps", i)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-gray-400">Details</label>
                              <textarea
                                rows="2"
                                value={step.details}
                                onChange={(e) => handleArrayChange("timelineSection.steps", i, "details", e.target.value)}
                                className="w-full rounded border px-2 py-1 text-xs bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services / Blueprint Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Agronomic Blueprint</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                            <input
                              type="text"
                              value={currentData.content.servicesSection?.title || ""}
                              onChange={(e) => handleContentChange("servicesSection", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={currentData.content.servicesSection?.subtitle || ""}
                              onChange={(e) => handleContentChange("servicesSection", "subtitle", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>

                        {/* 4 Agronomic Services */}
                        <div className="border-t pt-4 space-y-4">
                          <span className="text-xs font-bold uppercase text-gray-400 block">Agronomic Services list (Optimal: 4)</span>
                          {currentData.content.servicesSection?.services?.map((serv, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl border space-y-2">
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">Service Title</label>
                                  <input
                                    type="text"
                                    value={serv.title}
                                    onChange={(e) => handleArrayChange("servicesSection.services", i, "title", e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-xs bg-white font-bold"
                                  />
                                </div>
                                <div className="w-1/3">
                                  <label className="block text-[10px] font-bold uppercase text-gray-400">Icon</label>
                                  <select
                                    value={serv.iconName}
                                    onChange={(e) => handleArrayChange("servicesSection.services", i, "iconName", e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-xs bg-white"
                                  >
                                    <option value="Beaker">Beaker</option>
                                    <option value="Sprout">Sprout</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Scissors">Scissors</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400">Description</label>
                                <textarea
                                  rows="2"
                                  value={serv.description}
                                  onChange={(e) => handleArrayChange("servicesSection.services", i, "description", e.target.value)}
                                  className="w-full rounded border px-2 py-1 text-xs bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact Footer Section */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Contact Footer Info</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Heading</label>
                            <input
                              type="text"
                              value={currentData.content.footerSection?.title || ""}
                              onChange={(e) => handleContentChange("footerSection", "title", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                            <input
                              type="text"
                              value={currentData.content.footerSection?.description || ""}
                              onChange={(e) => handleContentChange("footerSection", "description", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact Phone</label>
                            <input
                              type="text"
                              value={currentData.content.footerSection?.phone || ""}
                              onChange={(e) => handleContentChange("footerSection", "phone", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact Email</label>
                            <input
                              type="text"
                              value={currentData.content.footerSection?.email || ""}
                              onChange={(e) => handleContentChange("footerSection", "email", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            ) : (
              // ── SEO MANAGER SETTINGS EDITOR ──
              <div className="space-y-6">
                
                {/* Meta Tags Configuration */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-black text-gray-900 border-b pb-2 uppercase tracking-wide">Meta & OpenGraph Tags</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Meta Title</label>
                        <span className={`text-[10px] font-bold ${
                          (currentData.seo?.title || "").length >= 50 && (currentData.seo?.title || "").length <= 60 ? "text-green-600" : "text-amber-500"
                        }`}>{(currentData.seo?.title || "").length} chars (Optimal: 50-60)</span>
                      </div>
                      <input
                        type="text"
                        value={currentData.seo?.title || ""}
                        onChange={(e) => handleSeoChange("title", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                        placeholder="e.g. About Us - Super Napier Grass Seeds"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Meta Description</label>
                        <span className={`text-[10px] font-bold ${
                          (currentData.seo?.description || "").length >= 120 && (currentData.seo?.description || "").length <= 160 ? "text-green-600" : "text-amber-500"
                        }`}>{(currentData.seo?.description || "").length} chars (Optimal: 120-160)</span>
                      </div>
                      <textarea
                        rows="3"
                        value={currentData.seo?.description || ""}
                        onChange={(e) => handleSeoChange("description", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                        placeholder="Farming info..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Meta Keywords (Comma separated)</label>
                      <input
                        type="text"
                        value={currentData.seo?.keywords?.join(", ") || ""}
                        onChange={(e) => handleSeoChange("keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a2613]"
                        placeholder="fodder, grass, biofuel"
                      />
                    </div>

                    <div className="border-t pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">OG Title</label>
                        <input
                          type="text"
                          value={currentData.seo?.ogTitle || ""}
                          onChange={(e) => handleSeoChange("ogTitle", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          placeholder="Social title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">OG Description</label>
                        <input
                          type="text"
                          value={currentData.seo?.ogDescription || ""}
                          onChange={(e) => handleSeoChange("ogDescription", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                          placeholder="Social description"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">OG Image URL</label>
                      <input
                        type="text"
                        value={currentData.seo?.ogImage || ""}
                        onChange={(e) => handleSeoChange("ogImage", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Structured Schema Markup (JSON-LD) */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-2 flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Structured Data (JSON-LD Schema)</h3>
                    <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded">schema.org</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed flex items-center gap-1">
                      <Info className="h-3 w-3 text-blue-500" /> Specify search engine structured data JSON-LD. Must contain standard fields <code>"@context"</code> and <code>"@type"</code>.
                    </p>
                    <textarea
                      rows="8"
                      value={
                        typeof currentData.seo?.jsonLd === "object" && currentData.seo?.jsonLd !== null
                          ? JSON.stringify(currentData.seo.jsonLd, null, 2)
                          : currentData.seo?.jsonLd || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        // Save string representation, save handler will validate and parse
                        handleSeoChange("jsonLd", val);
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-mono bg-gray-900 text-green-400 focus:outline-none"
                      placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "AboutPage",\n  "name": "Super Napier"\n}`}
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Sidebar Columns (SEO Score Card & Google Search Preview) */}
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Publishing</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#0a2613] hover:bg-black text-white font-bold py-3 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    "Save & Publish Page"
                  )}
                </button>
                <button
                  onClick={fetchPageData}
                  disabled={saving}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 rounded-2xl text-xs transition"
                >
                  Discard / Reset to DB
                </button>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>Last Updated:</span>
                  <span>{currentData.updatedAt ? new Date(currentData.updatedAt).toLocaleString() : "Never"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium mt-1">
                  <span>Author:</span>
                  <span>{currentData.updatedBy || "admin"}</span>
                </div>
              </div>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Google Search Snippet Preview</h3>
              <div className="border border-gray-100 bg-white p-4 rounded-2xl shadow-sm text-left">
                <div className="text-xs text-gray-500 font-sans truncate mb-0.5">
                  https://www.supernapier.com <span className="text-gray-400">› {activePage}</span>
                </div>
                <div className="text-xl text-blue-800 hover:underline font-medium leading-tight truncate mb-1">
                  {currentData.seo?.title || (activePage === "about" ? "About Us - Super Napier" : "Strategic Partnerships - Super Napier")}
                </div>
                <div className="text-xs text-gray-600 leading-normal font-sans break-words line-clamp-3">
                  {currentData.seo?.description || "Quality Grass Seed and Agricultural Products from Super Napier. Best fodder solutions for your livestock."}
                </div>
              </div>
            </div>

            {/* Real-time SEO Analysis Checklist */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">SEO Score Checklist</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`text-2xl font-black ${
                    seoCheck.score >= 80 ? "text-green-600" : seoCheck.score >= 50 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {seoCheck.score}
                  </span>
                  <span className="text-xs font-bold text-gray-400">/100</span>
                </div>
              </div>

              {/* Focus Keyword Input */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Focus Keyword Indicator</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. napier, bio-industrial"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Checklist list */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {seoCheck.checks.map((check, i) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs text-gray-600">
                    {check.type === "success" && (
                      <CheckCircle className="h-4.5 w-4.5 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {check.type === "warning" && (
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    {check.type === "error" && (
                      <XCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    {check.type === "info" && (
                      <Info className="h-4.5 w-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{check.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
