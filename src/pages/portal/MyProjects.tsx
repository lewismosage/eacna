import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import {
  PlusCircle,
  FileText,
  Users,
  Tag,
  ExternalLink,
  Edit,
  Trash,
  Share,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const MyProjects = () => {
  const navigate = useNavigate();
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Clinical Research");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);

  interface Project {
    id: number;
    title: string;
    category: string;
    content: string;
    author: string;
    publishedAt: string;
    tags?: string[];
    file_url?: string;
    type: string;
  }

  interface User {
    id: string;
    email?: string;
    user_metadata: {
      full_name: string;
    };
  }

  const [projects, setProjects] = useState<Project[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getText());
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setUser({
          id: userData.user.id,
          email: userData.user.email,
          user_metadata: {
            full_name: userData.user.user_metadata.full_name || "Unknown",
          },
        });
      }
    };

    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data);
      }
    };

    fetchUser();
    fetchProjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.from("projects").insert([
      {
        title,
        category,
        content,
        file_url: file ? file.name : null,
        author: user?.user_metadata.full_name || "Unknown",
        publishedAt: new Date().toISOString(),
        type: "research", // Set the type field
        tags: [], // Initialize tags as an empty array
      },
    ]);

    if (error) {
      setStatus("Error submitting project");
      console.error(error);
    } else {
      setStatus("Project submitted successfully");
      setTitle("");
      setCategory("Clinical Research");
      setContent("");
      setFile(null);
      editor?.commands.clearContent();
      if (data) {
        setProjects([...projects, data[0]]);
      }
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setTitle(project.title);
    setCategory(project.category);
    setContent(project.content);
    editor?.commands.setContent(project.content);
    setShowEditor(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    const { data, error } = await supabase
      .from("projects")
      .update({
        title,
        category,
        content,
        file_url: file ? file.name : selectedProject.file_url,
      })
      .eq("id", selectedProject.id);

    if (error) {
      setStatus("Error updating project");
      console.error(error);
    } else {
      setStatus("Project updated successfully");
      setProjects(
        projects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                title,
                category,
                content,
                file_url: file ? file.name : selectedProject.file_url,
              }
            : project
        )
      );
      setShowEditor(false);
      setSelectedProject(null);
    }
  };

  const handleDelete = async (projectId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const { error: projectError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    const { error: researchError } = await supabase
      .from("research")
      .delete()
      .eq("id", projectId);

    if (projectError || researchError) {
      console.error("Error deleting project:", projectError || researchError);
    } else {
      setProjects(projects.filter((project) => project.id !== projectId));
    }
  };

  const handleShare = async (project: Project) => {
    const { data, error } = await supabase.from("research").insert([
      {
        title: project.title,
        category: project.category,
        content: project.content,
        author: project.author || user?.user_metadata.full_name || "Unknown",
        publishedAt: project.publishedAt || new Date().toISOString(),
        tags: project.tags || [], // Ensure the tags field is populated
        file_url: project.file_url,
        type: project.type || "research", // Ensure the type field is populated
      },
    ]);

    if (error) {
      console.error("Error sharing project:", error);
      setShareStatus(`Failed to share the project: ${error.message}`);
    } else {
      setShareStatus("Shared to Articles & Resources!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Projects
          </h2>
          <button
            onClick={() => setShowEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Article
          </button>
        </div>

        {showEditor && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={selectedProject ? handleUpdate : handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Clinical Research">Clinical Research</option>
                  <option value="Development">Development</option>
                  <option value="Intervention">Intervention</option>
                  <option value="Technology">Technology</option>
                  <option value="Case Studies">Case Studies</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <div className="mt-1">
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload File (Word/PDF)
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="links"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attach Links
                </label>
                <input
                  id="links"
                  name="links"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="videos"
                  className="block text-sm font-medium text-gray-700"
                >
                  Embed Videos (YouTube, Vimeo)
                </label>
                <input
                  id="videos"
                  name="videos"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {selectedProject ? "Update" : "Submit"}
                </button>
              </div>
            </form>
            {status && (
              <p className="mt-4 text-center text-green-600">{status}</p>
            )}
          </div>
        )}

        {/* Display projects here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <span className="text-sm font-medium text-blue-600">
                      {project.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.content}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{project.author}</span>
                  <span className="mx-2">•</span>
                  <span>{project.publishedAt}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags &&
                    project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-4 w-4 mr-1" />
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-5 w-5 mr-2" />
                    Delete
                  </button>
                  <button
                    onClick={() => handleShare(project)}
                    className="inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    <Share className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
                {shareStatus && (
                  <p className="mt-4 text-center text-green-600">
                    {shareStatus}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;