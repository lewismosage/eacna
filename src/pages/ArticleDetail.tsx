import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Users, Tag } from "lucide-react";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("research")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
      } else {
        setArticle(data);
      }
    };

    fetchArticle();
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Users className="h-4 w-4 mr-1" />
            <span>{article.author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags &&
              article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  {tag}
                </span>
              ))}
          </div>
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;