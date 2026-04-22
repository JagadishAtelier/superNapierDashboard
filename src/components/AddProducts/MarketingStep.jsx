import React, { useState } from 'react';
import { Plus, Trash2, BarChart2, BookOpen, Upload, Loader2, X } from 'lucide-react';
import { uploadToCloudinary } from '../../api/imageUpload';

const MarketingStep = ({ 
    highlights, setHighlights, 
    howToUse, setHowToUse 
}) => {
    const [uploadingIndex, setUploadingIndex] = useState(null); // 'h-0' or 's-0'

    const handleFileChange = async (e, type, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadId = `${type}-${index}`;
        setUploadingIndex(uploadId);

        try {
            const url = await uploadToCloudinary(file, "marketing");
            if (type === 'h') {
                updateHighlight(index, 'image', url);
            } else {
                updateStep(index, 'image', url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploadingIndex(null);
        }
    };

    const addHighlight = () => {
        setHighlights([...highlights, { title: '', description: '', image: '' }]);
    };

    const updateHighlight = (index, field, value) => {
        const newHighlights = [...highlights];
        newHighlights[index][field] = value;
        setHighlights(newHighlights);
    };

    const removeHighlight = (index) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const addStep = () => {
        setHowToUse([...howToUse, { title: '', heading: '', description: '', image: '', bullets: [''] }]);
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...howToUse];
        newSteps[index][field] = value;
        setHowToUse(newSteps);
    };

    const removeStep = (index) => {
        setHowToUse(howToUse.filter((_, i) => i !== index));
    };

    const addBullet = (stepIndex) => {
        const newSteps = [...howToUse];
        newSteps[stepIndex].bullets.push('');
        setHowToUse(newSteps);
    };

    const updateBullet = (stepIndex, bulletIndex, value) => {
        const newSteps = [...howToUse];
        newSteps[stepIndex].bullets[bulletIndex] = value;
        setHowToUse(newSteps);
    };

    const removeBullet = (stepIndex, bulletIndex) => {
        const newSteps = [...howToUse];
        newSteps[stepIndex].bullets = newSteps[stepIndex].bullets.filter((_, i) => i !== bulletIndex);
        setHowToUse(newSteps);
    };

    const ImagePicker = ({ image, onUpload, isUploading, onClear }) => (
        <div className="relative group">
            {image ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 bg-white text-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
                        </label>
                        <button onClick={onClear} className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group">
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    ) : (
                        <>
                            <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 rounded-full mb-2 transition-colors">
                                <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 group-hover:text-green-700 uppercase tracking-widest">Upload Image</span>
                        </>
                    )}
                    <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={isUploading} />
                </label>
            )
            }
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Statistical Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BarChart2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Statistical Highlights</h3>
                    </div>
                    <button
                        onClick={addHighlight}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Highlight
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((h, i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4 relative group h-full flex flex-col">
                            <button
                                onClick={() => removeHighlight(i)}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <ImagePicker 
                                image={h.image} 
                                onUpload={(e) => handleFileChange(e, 'h', i)} 
                                isUploading={uploadingIndex === `h-${i}`}
                                onClear={() => updateHighlight(i, 'image', '')}
                            />

                            <input
                                type="text"
                                placeholder="Title (e.g. 98% Germination)"
                                value={h.title}
                                onChange={(e) => updateHighlight(i, 'title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500 font-bold"
                            />
                            <textarea
                                placeholder="Description"
                                value={h.description}
                                onChange={(e) => updateHighlight(i, 'description', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500 h-20 text-sm flex-grow"
                            />
                        </div>
                    ))}
                    {highlights.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400 text-sm italic">No highlights added yet.</div>
                    )}
                </div>
            </div>

            {/* How To Use Guide */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">How To Use Guide</h3>
                    </div>
                    <button
                        onClick={addStep}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Step
                    </button>
                </div>

                <div className="space-y-6">
                    {howToUse.map((s, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 relative">
                            <div className="flex items-center justify-between">
                                <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">
                                    {i + 1}
                                </span>
                                <button
                                    onClick={() => removeStep(i)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                                <ImagePicker 
                                    image={s.image} 
                                    onUpload={(e) => handleFileChange(e, 's', i)} 
                                    isUploading={uploadingIndex === `s-${i}`}
                                    onClear={() => updateStep(i, 'image', '')}
                                />
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Step Title (e.g. Land Preparation)"
                                        value={s.title}
                                        onChange={(e) => updateStep(i, 'title', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500 font-bold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Heading (e.g. Creating the perfect foundation)"
                                        value={s.heading}
                                        onChange={(e) => updateStep(i, 'heading', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                    <textarea
                                        placeholder="Detailed Description"
                                        value={s.description}
                                        onChange={(e) => updateStep(i, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500 h-24 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-200/50">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bullet Points</label>
                                {s.bullets.map((b, bi) => (
                                    <div key={bi} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Bullet point..."
                                            value={b}
                                            onChange={(e) => updateBullet(i, bi, e.target.value)}
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                        />
                                        <button
                                            onClick={() => removeBullet(i, bi)}
                                            className="p-1 text-gray-300 hover:text-red-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addBullet(i)}
                                    className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Bullet
                                </button>
                            </div>
                        </div>
                    ))}
                    {howToUse.length === 0 && (
                        <p className="text-center py-8 text-gray-400 text-sm italic">No steps added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketingStep;
