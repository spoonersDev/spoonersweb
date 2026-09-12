import React, { useEffect, useState } from "react";

export default function EditableText({
  as: Element = "p",
  value = "",
  editable = false,
  onSave,
  className = "",
  label = "Text"
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  if (!editable) {
    return <Element className={className}>{value}</Element>;
  }

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await onSave(draftValue);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="cms-inline-editor mb-3">
        <label className="form-label small text-muted">{label}</label>
        <textarea
          className="form-control"
          rows={Element === "h1" ? 2 : 4}
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          autoFocus
        />
        {error && <div className="text-danger small mt-1">{error}</div>}
        <div className="d-flex gap-2 mt-2">
          <button type="button" className="btn btn-sm btn-primary" onClick={save} disabled={saving}>
            {saving ? "Speichert..." : "Speichern"}
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-editable-wrapper position-relative">
      <Element className={className}>{value}</Element>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary cms-edit-button"
        onClick={() => setIsEditing(true)}
        aria-label={`${label} bearbeiten`}
        title={`${label} bearbeiten`}
      >
        ✎
      </button>
    </div>
  );
}
