import React from "react";
import { Calendar, Trash2, Pencil, Eye } from "lucide-react";

const BlogCard = ({ blog, onDelete, onEdit, onView }) => {
  // Use first image if multiple images exist
  const image = blog.image?.length > 0 ? blog.image[0] : "https://via.placeholder.com/400";

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300">

      {/* Image */}
      <div className="relative md:aspect-[16/10] h-[35vh] md:h-auto overflow-hidden">
        <img
          src={image}
          alt={blog.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
        />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 
                        bg-gradient-to-t from-black/70 via-black/70 to-transparent">
          <h2 className="text-white text-lg font-semibold leading-snug">
            {blog.title?.length > 60 ? blog.title.substring(0, 60) + "..." : blog.title}
          </h2>
        </div>

        {/* Hover buttons */}
{/* Hover buttons */}
<div className="absolute lg:inset-0 top-4 left-4 lg:bg-black/50 lg:backdrop-blur-sm flex items-center justify-center lg:gap-4 gap-2
                opacity-100 lg:opacity-0 group-hover:md:opacity-100 transition-all duration-300 z-10">

          <button
            onClick={() => onView(blog)}
            className="bg-white lg:p-3 p-2 rounded-tl-[10px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[5px] shadow hover:bg-blue-100 transition"
          >
            <Eye size={18} className="text-blue-600" />
          </button>

          <button
            onClick={() => onEdit(blog)}
            className="bg-white lg:p-3 p-2 rounded-tl-[10px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[5px] shadow hover:bg-green-100 transition"
          >
            <Pencil size={18} className="text-green-700" />
          </button>

          <button
            onClick={() => onDelete(blog)}
            className="bg-white lg:p-3 p-2 rounded-tl-[10px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[5px] shadow hover:bg-red-100 transition"
          >
            <Trash2 size={18} className="text-red-500" />
          </button>
        </div>

        {/* Date */}
        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
          <Calendar size={16} className="text-green-700" />
          <span className="text-sm font-semibold text-gray-700">{blog.date}</span>
        </div>
      </div>
    </div>
  );
};

const BlogData = ({ blogs, onDelete, onEdit, onView }) => {
  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onDelete={onDelete}
              onEdit={onEdit}
              onView={onView}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 py-10">
            No blogs found
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogData;