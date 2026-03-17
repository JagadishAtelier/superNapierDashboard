import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getBlogById } from "../../api/blogApi";

export default function BlogView() {
  const { id } = useParams(); // get blog ID from URL
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const res = await getBlogById(id); // API returns { success: true, data: {...} }
      if (res?.success && res.data) {
        console.log(res.data)
        setBlog(res.data); // Use actual blog object
      } else {
        toast.error("Blog not found");
        setBlog(null);
      }
    } catch (err) {
      toast.error("Failed to fetch blog data");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!blog) return <div className="text-center py-20">No blog data found</div>;

  return (
    <div className="py-10 px-0 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT SIDE IMAGES */}
        <div className="lg:sticky lg:top-10 h-fit flex flex-col gap-4">
          {Array.isArray(blog.image) && blog.image.length > 0 ? (
            blog.image.map((img, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-md">
                <img
                  src={img}
                  alt={`${blog.title} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="rounded-3xl overflow-hidden shadow-md bg-gray-200 h-64 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="flex flex-col gap-6">

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={18} />
            <span>{blog.date}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-gray-600 leading-relaxed text-lg">{blog.excerpt}</p>

          {/* Full Content (HTML) */}
          <div
            className="text-gray-600 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
}