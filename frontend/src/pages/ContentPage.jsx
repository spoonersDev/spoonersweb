import React from "react";
import { useLocation, useParams } from "react-router-dom";
import EditableText from "../components/cms/EditableText";
import useContentBlocks from "../hooks/useContentBlocks";
import { isAdmin } from "../utils/auth";

export default function ContentPage() {
  const params = useParams();
  const location = useLocation();
  const slug = params["*"] || location.pathname.replace(/^\/+/, "");
  const preview = isAdmin() && new URLSearchParams(location.search).get("preview") === "draft";
  const { blocks, loading, error, updateBlock } = useContentBlocks(slug, { preview });
  const text = (key) => blocks[key]?.data?.text || "";
  const paragraphKeys = Object.keys(blocks)
    .filter((key) => key.startsWith("paragraph_"))
    .sort();

  return (
    <main className="page-shell">
      <section className="page-content">
        <div className="container page-text-wrap">
          {loading && <p className="lead text-telegrau">Inhalt wird geladen ...</p>}
          {!loading && error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && (
            <>
              <EditableText
                as="h1"
                className="display-5 fw-bold mb-3"
                label="Seitentitel"
                value={text("page_title")}
                editable={preview}
                onSave={(value) => updateBlock("page_title", value)}
              />
              <EditableText
                className="lead text-telegrau mb-4"
                label="Einleitung"
                value={text("page_lead")}
                editable={preview}
                onSave={(value) => updateBlock("page_lead", value)}
              />
              {paragraphKeys.map((key) => (
                <EditableText
                  key={key}
                  className="page-random-text mb-4"
                  label="Absatz"
                  value={text(key)}
                  editable={preview}
                  onSave={(value) => updateBlock(key, value)}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}