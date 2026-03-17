import { SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlogData from "./BlogData";
import { getAllBlogs, deleteBlog } from "../../api/blogApi";

export default function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");

useEffect(() => {
  fetchBlogs();
}, []);

const fetchBlogs = async () => {
  try {
    const res = await getAllBlogs();
    // Make sure we get an array
    const data = Array.isArray(res) ? res : res?.data || [];
    setBlogs(data);
  } catch (err) {
    toast.error("Failed to fetch blogs");
    setBlogs([]); // fallback to empty array
  }
};

const filteredBlogs = useMemo(() => {
  return Array.isArray(blogs)
    ? blogs.filter((b) =>
        (b.title + b.date).toLowerCase().includes(search.toLowerCase())
      )
    : [];
}, [search, blogs]);

  const handleDelete = async (blog) => {
    setBlogs((prev) => prev.filter((b) => b._id !== blog._id));
    try {
      await deleteBlog(blog._id);
      toast.success(`${blog.title} deleted`);
    } catch {
      toast.error("Failed to delete blog");
      setBlogs((prev) => [blog, ...prev]); // revert deletion
    }
  };

  const handleEdit = (blog) => navigate(`/Blogs/update/${blog._id}`, { state: blog });
  const handleView = (blog) => navigate(`/Blogs/blog-view/${blog._id}`, { state: blog });

  return (
    <div className="md:p-4">
      <h2 className="text-xl font-semibold mb-4">Blog List</h2>

      <div className="flex md:flex-row flex-col gap-4 items-center justify-between mb-10">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search blog..."
            className="w-full h-10 border rounded-tl-[18px] rounded-tr-[5px] rounded-br-[18px] rounded-bl-[5px] px-4 pr-10"
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon size={16} className="absolute top-1/2 right-3 -translate-y-1/2" />
        </div>

        <button
          onClick={() => navigate("/Blogs/update")}
          className="bg-yellow-400 px-4 py-2 rounded-tl-[10px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[5px] w-full md:w-fit"
        >
          Add Blog
        </button>
      </div>

      <BlogData
        blogs={filteredBlogs}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onView={handleView}
      />
    </div>
  );
}