import { useCallback, useEffect, useState } from "react";
import { getAuthSession } from "../utils/auth";

const API_BASE = "http://localhost:5001/api";

export default function useContentBlocks(slug, { preview = false } = {}) {
  const [blocks, setBlocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthSession()?.token;
      const query = preview ? "?preview=draft" : "";
      const response = await fetch(`${API_BASE}/content/${encodeURIComponent(slug)}${query}`, {
        headers: preview && token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Inhalt konnte nicht geladen werden.");
      }

      setBlocks(data.content?.blocks || {});
      setError("");
    } catch (err) {
      setError(err.message || "Inhalt konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [preview, slug]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const updateBlock = async (blockKey, text) => {
    const token = getAuthSession()?.token;
    const response = await fetch(`${API_BASE}/content/blocks/${encodeURIComponent(blockKey)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ slug, blockType: "text", data: { text } })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Änderung konnte nicht gespeichert werden.");
    }

    setBlocks((current) => ({ ...current, [blockKey]: data.block }));
    setHasChanges(true);
    return data.block;
  };

  return { blocks, loading, error, hasChanges, updateBlock, reload: loadBlocks };
}
