import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";
import "./PostProperty.css";

const fields = ["title", "description", "property_type", "listing_type", "price", "bedrooms", "bathrooms", "area", "city", "address", "availability_status"];

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "OWNER") return;
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}/`);
        const property = await response.json();
        if (!response.ok) throw new Error(property.detail || "Property not found.");
        if (property.owner !== user.id) throw new Error("You can only manage your own property.");
        setFormData(Object.fromEntries(fields.map((field) => [field, String(property[field] ?? "")])));
      } catch (requestError) { setError(requestError.message); }
    })();
  }, [id, user]);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}`, "Content-Type": "application/json" });
  const change = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}/`, { method: "PATCH", headers: headers(), body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || Object.values(data).flat()[0] || "Unable to save property.");
      navigate(`/properties/${id}`);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const remove = async () => {
    if (!window.confirm("Delete this property? Its images, interests, and conversations will also be deleted.")) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}/`, { method: "DELETE", headers: headers() });
      if (!response.ok) { const data = await response.json(); throw new Error(data.detail || "Unable to delete property."); }
      navigate("/owner-dashboard");
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  if (authLoading || (!error && !formData)) return <><Navbar /><main className="post-property-page">Loading property…</main></>;
  if (!user || user.role !== "OWNER") return <><Navbar /><main className="post-property-page"><div className="post-property-card"><h1>Owner access required</h1><Link to="/properties">Browse properties</Link></div></main></>;
  if (!formData) return <><Navbar /><main className="post-property-page"><div className="post-property-card"><h1>Unable to edit property</h1><p className="post-property-error">{error}</p></div></main></>;
  return <><Navbar /><main className="post-property-page"><div className="post-property-card"><h1>Edit property</h1>{error && <p className="post-property-error">{error}</p>}<form onSubmit={save}>
    <label>Title<input name="title" value={formData.title} onChange={change} required /></label><label>Description<textarea name="description" value={formData.description} onChange={change} rows="5" required /></label>
    <div className="form-row"><label>Property type<select name="property_type" value={formData.property_type} onChange={change}><option value="FLAT">Flat</option><option value="HOUSE">House</option><option value="PG">PG</option></select></label><label>Listing type<select name="listing_type" value={formData.listing_type} onChange={change}><option value="SALE">Sale</option><option value="RENT">Rent</option></select></label></div>
    <div className="form-row"><label>Price<input name="price" type="number" min="0" value={formData.price} onChange={change} required /></label><label>Area (sq ft)<input name="area" type="number" min="1" value={formData.area} onChange={change} required /></label></div>
    <div className="form-row"><label>Bedrooms<input name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={change} required /></label><label>Bathrooms<input name="bathrooms" type="number" min="0" value={formData.bathrooms} onChange={change} required /></label></div>
    <label>City<input name="city" value={formData.city} onChange={change} required /></label><label>Address<input name="address" value={formData.address} onChange={change} required /></label><label>Availability<select name="availability_status" value={formData.availability_status} onChange={change}><option value="AVAILABLE">Available</option><option value="RENTED">Rented</option><option value="SOLD">Sold</option></select></label>
    <button type="submit" className="post-property-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={remove} disabled={saving} style={{ marginTop: 12, width: "100%", padding: 12, color: "#b42318", background: "white", border: "1px solid #b42318", borderRadius: 6 }}>Delete property</button>
  </form></div></main></>;
}

export default EditProperty;
