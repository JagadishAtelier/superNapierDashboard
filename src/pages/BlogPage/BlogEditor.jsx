import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  Link2,
  Image as ImageIcon,
  X,
  ChevronDown,
  Lightbulb,
  Image,
} from "lucide-react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { createBlog, updateBlog, getBlogById } from "../../api/blogApi";
import toast from "react-hot-toast";

const BlogEditor = () => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    excerpt: "",
    content: "",
    image: [],
  });
  const [loading, setLoading] = useState(false);

  const maxLength = 2000;

  // Fetch blog if editing
  useEffect(() => {
    if (isEdit) fetchBlogData();
  }, [id]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const res = await getBlogById(id);
      if (res?.success && res.data) {
        const blog = res.data;
        setFormData({
          title: blog.title || "",
          date: blog.date ? new Date(blog.date).toISOString().split("T")[0] : "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          image: blog.image || [],
        });
        if (blog.image?.length) {
          setImages(blog.image.map((img) => ({ preview: img })));
        }
        if (editorRef.current) editorRef.current.innerHTML = blog.content || "";
      } else {
        toast.error("Blog not found");
      }
    } catch (err) {
      toast.error("Failed to fetch blog data");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Text formatting
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const addLink = () => {
    const url = prompt("Enter URL");
    if (url) formatText("createLink", url);
  };

  // Thumbnail upload
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Editor image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.maxWidth = "100%";
      img.style.margin = "15px auto";
      img.style.borderRadius = "12px";

      const wrapper = document.createElement("div");
      wrapper.style.textAlign = "center";
      wrapper.appendChild(img);

      const selection = window.getSelection();
      if (!selection.rangeCount) {
        editorRef.current.appendChild(wrapper);
        return;
      }
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);
      range.setStartAfter(wrapper);
      range.setEndAfter(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
      editorRef.current.focus();
    };
    reader.readAsDataURL(file);
  };

  // Sync editor content
  const handleEditorInput = () => {
    setFormData((prev) => ({ ...prev, content: editorRef.current.innerHTML }));
  };

  // Save blog (dynamic)
  const handleSave = async () => {
    const content = editorRef.current.innerHTML;
    setFormData((prev) => ({ ...prev, content }));

    if (!formData.title || !content || images.length === 0) {
      toast.error("Title, content, and thumbnail are required!");
      return;
    }

    const imageArray = images.map((img) => img.preview);

    const blogPayload = { ...formData, content, image: imageArray };

    try {
      setLoading(true);
      if (isEdit) {
        await updateBlog(id, blogPayload);
        toast.success("Blog updated successfully!");
      } else {
        await createBlog(blogPayload);
        toast.success("Blog created successfully!");
      }
      navigate("/Blogs"); // redirect to blog list after save
    } catch (err) {
      toast.error("Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col md:p-6">
      <h2 className="text-xl font-semibold mb-6">{isEdit ? "Edit Blog" : "Add Blog"}</h2>

      <div className="w-full">
        {/* Input Fields */}
        <div className="mb-6 space-y-5">
          <div className="flex md:flex-row flex-col gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter blog title..."
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              placeholder="Enter a short summary..."
              value={formData.excerpt}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={3}
            />
          </div>
        </div>

        {/* Thumbnail Uploader */}
        <div className="relative mb-6">
          <div className="rounded-lg border p-5 bg-white">
            <label className="flex items-center border-b pb-4 font-medium text-gray-800">
              <ChevronDown className="mr-2 size-4" />
              Thumbnail Image <span className="text-red-500 ml-1">*</span>
            </label>

            <div className="mt-4">
              <div className="mb-4 flex items-center text-sm text-gray-600">
                <Lightbulb className="text-yellow-500 h-5 w-5" />
                <span className="ml-2">Upload a clean blog thumbnail image</span>
              </div>

              <div className="border-2 border-dashed rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative h-28 rounded-xl shadow">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  onClick={() => thumbInputRef.current.click()}
                  className="mt-6 flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Image className="size-4 text-indigo-500" />
                  <span className="text-indigo-600 font-medium">Upload thumbnail</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={thumbInputRef}
                  onChange={handleFilesChange}
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700 ">
            Content <span className="text-red-500">*</span>
          </label>
        </div>
        {/* Editor Toolbar */}
        <div className="bg-white shadow border rounded-xl w-fit px-3 py-2 flex gap-2 mb-3 flex-wrap">
          <button onClick={() => formatText("bold")} className="p-2 hover:bg-gray-100 rounded">
            <Bold size={18} />
          </button>
          <button onClick={() => formatText("italic")} className="p-2 hover:bg-gray-100 rounded">
            <Italic size={18} />
          </button>
          <button onClick={() => formatText("underline")} className="p-2 hover:bg-gray-100 rounded">
            <Underline size={18} />
          </button>
          <button onClick={() => formatText("justifyLeft")} className="p-2 hover:bg-gray-100 rounded">
            <AlignLeft size={18} />
          </button>
          <button onClick={() => formatText("justifyCenter")} className="p-2 hover:bg-gray-100 rounded">
            <AlignCenter size={18} />
          </button>
          <button onClick={() => formatText("insertUnorderedList")} className="p-2 hover:bg-gray-100 rounded">
            <List size={18} />
          </button>
          <button onClick={addLink} className="p-2 hover:bg-gray-100 rounded">
            <Link2 size={18} />
          </button>
          {/* <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded">
            <ImageIcon size={18} />
          </button> */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          onInput={handleEditorInput}
          contentEditable
          data-placeholder="Write your blog..."
          className="editor w-full h-[350px] p-6 rounded-xl border bg-white outline-none overflow-auto"
        />

        {/* Footer */}
        <div className="flex justify-between mt-4">
          <span className="text-sm text-gray-500">Max {maxLength} characters</span>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#4ade80] to-[#16a34a] relative rounded-tl-[10px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[5px] px-6 py-2 text-white"
          >
            {isEdit ? "Update Blog" : "Save Blog"}
          </button>
        </div>
      </div>

      <style>
        {`
          .editor:empty:before {
            content: attr(data-placeholder);
            color: #999;
          }
        `}
      </style>
    </div>
  );
};

export default BlogEditor;