import React, { useEffect, useState } from "react";
import { getAuthSession } from "../utils/auth";

const API_BASE = "http://localhost:5001/api";

const PAGE_OPTIONS = [
  { label: "Spooners", path: "/das-sind-wir-1" },
  { label: "Unser Van", path: "/unser-van" },
  { label: "Unimog Projekt", path: "/unimog-projekt" },
  { label: "Fahrzeugvorstellung", path: "/unimog-projekt/fahrzeugvorstellung" },
  { label: "Planung & Konzept", path: "/unimog-projekt/planung-konzept" },
  { label: "Der Ausbau", path: "/unimog-projekt/der-ausbau" },
  { label: "Wandern", path: "/wandern-1" },
  { label: "Unsere Ausrüstung", path: "/unsere-ausruestung" },
  { label: "Blog", path: "/blog" },
  { label: "East Tour 2024/2025", path: "/blog/east-tour-2024-2025" },
  { label: "Video Blog #Vlog", path: "/blog/video-blog-vlog" },
  { label: "Nützliches", path: "/nuetzliches" },
  { label: "So erreichst du uns", path: "/so-erreichst-du-uns" }
];

function normalizeMenuTree(items = []) {
  return items.map((item) => ({
    ...item,
    children: item.children || []
  }));
}

function flattenMenu(items, depth = 0, result = []) {
  items.forEach((item) => {
    result.push({ ...item, depth });
    flattenMenu(item.children || [], depth + 1, result);
  });
  return result;
}

function updateSortOrders(items) {
  return items.map((item, index) => ({
    ...item,
    sort_order: index,
    children: updateSortOrders(item.children || [])
  }));
}

export default function AdminDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/menu`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Menü konnte nicht geladen werden.");
      }

      setMenuItems(normalizeMenuTree(data.items));
      setOrderChanged(false);
      setError("");
    } catch (err) {
      setError(err.message || "Fehler beim Laden des Menüs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const refreshMenu = async () => {
    setRefreshing(true);
    await loadMenu();
    window.dispatchEvent(new Event("menu:refresh"));
    setRefreshing(false);
  };

  const startNewItem = (parentId = null) => {
    setDraft({
      id: null,
      label: "",
      path: PAGE_OPTIONS[0].path,
      parentId,
      isActive: true
    });
  };

  const startEdit = (item) => {
    setDraft({
      id: item.id,
      label: item.label,
      path: item.path,
      parentId: item.parent_id ?? null,
      isActive: item.is_active ?? true
    });
  };

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  };

  const validateDraft = () => {
    if (!draft?.label?.trim()) {
      return "Bitte einen Namen eingeben.";
    }

    if (!draft?.path) {
      return "Bitte eine Zielseite auswählen.";
    }

    return "";
  };

  const saveDraft = async () => {
    const validationMessage = validateDraft();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const token = getAuthSession()?.token;
    const payload = {
      label: draft.label.trim(),
      path: draft.path,
      parentId: draft.parentId,
      sortOrder: 0,
      isActive: Boolean(draft.isActive)
    };

    try {
      const method = draft.id ? "PUT" : "POST";
      const url = draft.id ? `${API_BASE}/menu/${draft.id}` : `${API_BASE}/menu`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Speichern fehlgeschlagen.");
      }

      setDraft(null);
      setError("");
      await loadMenu();
    } catch (err) {
      setError(err.message || "Speichern fehlgeschlagen.");
    }
  };

  const moveItem = (itemId, direction) => {
    const reorder = (items) => {
      const index = items.findIndex((item) => item.id === itemId);

      if (index !== -1) {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= items.length) return items;

        const reordered = [...items];
        [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
        return updateSortOrders(reordered);
      }

      return items.map((item) => ({
        ...item,
        children: reorder(item.children || [])
      }));
    };

    setMenuItems((current) => reorder(current));
    setOrderChanged(true);
  };

  const saveMenuOrder = async () => {
    const token = getAuthSession()?.token;

    try {
      setOrderSaving(true);
      await Promise.all(
        flattenMenu(menuItems).map((item) =>
          fetch(`${API_BASE}/menu/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              label: item.label,
              path: item.path,
              parentId: item.parent_id ?? null,
              sortOrder: item.sort_order,
              isActive: item.is_active
            })
          }).then(async (response) => {
            const data = await response.json();
            if (!response.ok || !data.success) {
              throw new Error(data.message || "Reihenfolge konnte nicht gespeichert werden.");
            }
          })
        )
      );
      setOrderChanged(false);
      setError("");
      window.dispatchEvent(new Event("menu:refresh"));
    } catch (err) {
      setError(err.message || "Reihenfolge konnte nicht gespeichert werden.");
    } finally {
      setOrderSaving(false);
    }
  };

  const deleteItem = async (itemId) => {
    const token = getAuthSession()?.token;

    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Löschen fehlgeschlagen.");
      }

      setDraft(null);
      setError("");
      await loadMenu();
    } catch (err) {
      setError(err.message || "Löschen fehlgeschlagen.");
    }
  };

  const renderMenuTree = (items, depth = 0) =>
    items.map((item, index) => (
      <div key={item.id} style={{ marginLeft: depth * 20 }}>
        <div className="d-flex align-items-center justify-content-between border-bottom py-2">
          <div>
            <div className="fw-semibold">{item.label}</div>
            <small className="text-muted">
              {PAGE_OPTIONS.find((page) => page.path === item.path)?.label || item.path}
            </small>
          </div>

          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => moveItem(item.id, -1)}
              disabled={index === 0}
              title="Nach oben"
              aria-label={`${item.label} nach oben verschieben`}
            >
              ↑
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => moveItem(item.id, 1)}
              disabled={index === items.length - 1}
              title="Nach unten"
              aria-label={`${item.label} nach unten verschieben`}
            >
              ↓
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => startEdit(item)}
            >
              Bearbeiten
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => startNewItem(item.id)}
            >
              Unterpunkt
            </button>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => deleteItem(item.id)}
            >
              Löschen
            </button>
          </div>
        </div>

        {item.children && item.children.length > 0 && (
          <div className="mt-2">{renderMenuTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));

  return (
    <main className="page-shell">
      <section className="page-content">
        <div className="container page-text-wrap">
          <h1 className="display-5 fw-bold mb-3">Admin Bereich</h1>
          <p className="lead text-telegrau mb-4">
            Hier werden Inhalte, Navigation und Medien gepflegt.
          </p>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Menü verwalten</h2>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
              {orderChanged && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={saveMenuOrder}
                  disabled={orderSaving}
                >
                  {orderSaving ? "Wird gespeichert..." : "Reihenfolge speichern"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={refreshMenu}
                disabled={refreshing || loading}
              >
                {refreshing ? "Aktualisiere..." : "Menü aktualisieren"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => startNewItem(null)}
              >
                Neuer Menüpunkt
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-muted">Menü wird geladen...</div>
              ) : menuItems.length === 0 ? (
                <div className="text-muted">Noch keine Menüeinträge vorhanden.</div>
              ) : (
                renderMenuTree(menuItems)
              )}
            </div>
          </div>

          {draft && (
            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h3 className="h5 mb-3">
                  {draft.id ? "Eintrag bearbeiten" : "Neuen Menüpunkt anlegen"}
                </h3>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={draft.label}
                      onChange={(e) => handleDraftChange("label", e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="menu-page" className="form-label">Zielseite</label>
                    <select
                      id="menu-page"
                      className="form-select"
                      value={draft.path}
                      onChange={(e) => handleDraftChange("path", e.target.value)}
                    >
                      {PAGE_OPTIONS.map((page) => (
                        <option key={page.path} value={page.path}>{page.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="menu-parent" className="form-label">Übergeordnetes Menü</label>
                    <select
                      id="menu-parent"
                      className="form-select"
                      value={draft.parentId ?? ""}
                      onChange={(e) =>
                        handleDraftChange(
                          "parentId",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <option value="">Hauptmenü</option>
                      {flattenMenu(menuItems)
                        .filter((item) => item.id !== draft.id)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {`${"— ".repeat(item.depth)}${item.label}`}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Aktiv</label>
                    <select
                      className="form-select"
                      value={draft.isActive ? "true" : "false"}
                      onChange={(e) =>
                        handleDraftChange("isActive", e.target.value === "true")
                      }
                    >
                      <option value="true">Ja</option>
                      <option value="false">Nein</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={saveDraft}
                  >
                    Speichern
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setDraft(null)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
