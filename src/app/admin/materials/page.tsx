"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

interface MaterialItem {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  url: string;
  category: string;
}

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload Form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Reference Book");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please choose a file to upload.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", uploadCategory);

      const res = await fetch("/api/admin/materials", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Study material uploaded successfully!");
        setShowUploadModal(false);
        setSelectedFile(null);
        fetchMaterials();
      } else {
        alert(data.error || "Failed to upload file.");
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    const confirmed = window.confirm(`Delete ${fileName} from study materials?`);
    if (!confirmed) return;

    try {
      setDeletingId(fileName);
      const res = await fetch(`/api/admin/materials?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.name !== fileName));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete file.");
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ["all", "Reference Book", "Reference Notes", "Question Bank", "Formula Sheet", "Syllabus Guide"];

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Study Materials & Reference Books
              </h1>
              <p className="text-sm text-slate-500">
                Upload textbooks, lecture notes, formula sheets, and question banks for candidate preparation and AI test generation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMaterials}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/exams/new"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg text-sm font-semibold transition"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Generate Test from Materials</span>
          </Link>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Uploaded Resources
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{materials.length}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">Available for student study</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <FolderOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cloud Storage Bucket
            </p>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-mono">study-materials</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Direct CDN downloads active</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              AI Question Extractor
            </p>
            <h3 className="text-base font-bold text-white mt-1">Gemini 1.5 Flash Engine</h3>
            <p className="text-xs text-purple-300 mt-1">Parses syllabus topics automatically</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents or textbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Document / Reference Material</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">File Size</th>
                <th className="py-3 px-5">Uploaded Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading library materials...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No study materials found. Click <b>"Upload Material"</b> above to add books and notes!
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {item.name}
                          </p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center mt-0.5"
                          >
                            Download Direct File &rarr;
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-600 font-mono">
                      {item.size}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2">
                      <a
                        href={item.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1 rounded hover:bg-blue-50 border border-blue-200 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>

                      <Link
                        href={`/admin/exams/new?materialUrl=${encodeURIComponent(item.url)}&materialName=${encodeURIComponent(item.name)}`}
                        className="inline-flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-800 font-medium px-2.5 py-1 rounded hover:bg-purple-50 border border-purple-200 transition"
                        title="Use this file for AI question generation"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Test</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(item.name)}
                        disabled={deletingId === item.name}
                        className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1 rounded hover:bg-rose-50 border border-rose-200 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === item.name ? "Deleting..." : "Delete"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Upload Study Material
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload textbooks, question banks, or formula sheets (PDF, DOCX, TXT)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Material Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="Reference Book">Reference Book / Textbook</option>
                  <option value="Reference Notes">Lecture Notes / Summaries</option>
                  <option value="Question Bank">Question Bank / Previous Year Papers</option>
                  <option value="Formula Sheet">Formula Sheet / Cheat Sheet</option>
                  <option value="Syllabus Guide">Syllabus / Curriculum Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/30"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click or drag file here to upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports PDF, DOC, DOCX, TXT, EPUB (Up to 50MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {uploading ? "Uploading to Cloud..." : "Upload Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
