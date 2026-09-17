import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";
import "./PostProperty.css";

function PostProperty() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "FLAT",
    listing_type: "SALE",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    city: "",
    address: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="post-property-page">
          <div className="post-property-card">
            <h1>Post Property</h1>
            <p>Please login first to post a property.</p>
            <button onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </main>
      </>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <>
        <Navbar />
        <main className="post-property-page">
          <div className="post-property-card">
            <h1>Post Property</h1>
            <p>Only property owners can post properties.</p>
          </div>
        </main>
      </>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const propertyResponse = await fetch(
        `${API_BASE_URL}/properties/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            property_type: formData.property_type,
            listing_type: formData.listing_type,
            price: formData.price,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            area: formData.area,
            city: formData.city,
            address: formData.address,
          }),
        }
      );

      const propertyData = await propertyResponse.json();

      if (!propertyResponse.ok) {
        const firstError =
          Object.values(propertyData).flat()[0];

        throw new Error(
          firstError || "Failed to create property."
        );
      }

      // Upload images after property creation
      for (const image of images) {
        const imageData = new FormData();
        imageData.append("property", propertyData.id);
        imageData.append("image", image);

        const imageResponse = await fetch(
          `${API_BASE_URL}/properties/${propertyData.id}/images/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageData,
          }
        );

        if (!imageResponse.ok) {
          console.error(
            "Image upload failed:",
            await imageResponse.text()
          );
        }
      }

      setSuccess("Property posted successfully!");

      setFormData({
        title: "",
        description: "",
        property_type: "FLAT",
        listing_type: "SALE",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        city: "",
        address: "",
      });

      setImages([]);

      setTimeout(() => {
        navigate("/owner-dashboard");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="post-property-page">
        <div className="post-property-card">
          <h1>Post Your Property</h1>

          <p className="post-property-subtitle">
            List your property directly for buyers and tenants.
          </p>

          {error && (
            <div className="post-property-error">
              {error}
            </div>
          )}

          {success && (
            <div className="post-property-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Property Title</label>
              <input
                name="title"
                type="text"
                placeholder="Example: Premium 2 BHK Flat in Pune"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your property..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Property Type</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                >
                  <option value="FLAT">Flat</option>
                  <option value="HOUSE">House</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              <div className="form-group">
                <label>Listing Type</label>
                <select
                  name="listing_type"
                  value={formData.listing_type}
                  onChange={handleChange}
                >
                  <option value="SALE">Sale</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  {formData.listing_type === "RENT"
                    ? "Monthly Rent"
                    : "Price"}
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Area (sq ft)</label>
                <input
                  name="area"
                  type="number"
                  placeholder="Example: 1200"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bedrooms</label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  placeholder="Example: 2"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  placeholder="Example: 2"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                type="text"
                placeholder="Example: Pune"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                type="text"
                placeholder="Full property address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Property Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              {images.length > 0 && (
                <p className="image-count">
                  {images.length} image(s) selected
                </p>
              )}
            </div>

            <button
              type="submit"
              className="post-property-button"
              disabled={loading}
            >
              {loading
                ? "Posting Property..."
                : "Post Property"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default PostProperty;
