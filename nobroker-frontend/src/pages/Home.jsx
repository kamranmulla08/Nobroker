import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL, getProperties } from "../services/api";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProperties() {
      try {
        const data = await getProperties();
        if (!cancelled) {
          setProperties(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load featured properties.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeaturedProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (city.trim()) {
      params.set("city", city.trim());
    }

    if (listingType) {
      params.set("listing_type", listingType);
    }

    const query = params.toString();
    navigate(`/properties${query ? `?${query}` : ""}`);
  };

  const getImageUrl = (property) => {
    const image = property.images?.[0]?.image;
    return image ? `${API_BASE_URL.replace(/\/api$/, "")}${image}` : null;
  };

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>Find a home you will love</h1>
            <p>Search homes directly from owners, without brokerage.</p>

            <form className="search-box" onSubmit={handleSearch}>
              <select
                aria-label="Listing type"
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
              >
                <option value="">Buy or rent</option>
                <option value="SALE">Buy</option>
                <option value="RENT">Rent</option>
              </select>
              <input
                type="search"
                aria-label="City"
                placeholder="Enter a city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
              <button type="submit">Search homes</button>
            </form>
          </div>
        </section>

        <section className="property-types">
          <h2>Featured properties</h2>

          {loading && <p className="status-message">Loading properties...</p>}
          {!loading && error && <p className="status-message error-message">{error}</p>}
          {!loading && !error && properties.length === 0 && (
            <p className="status-message">No properties are available yet.</p>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="property-type-grid">
              {properties.map((property) => {
                const imageUrl = getImageUrl(property);

                return (
                  <Link
                    className="property-type-card"
                    key={property.id}
                    to={`/properties/${property.id}`}
                  >
                    <div className="property-image-container">
                      {imageUrl ? (
                        <img className="property-image" src={imageUrl} alt={property.title} />
                      ) : (
                        <div className="no-image">No image available</div>
                      )}
                    </div>
                    <div className="property-card-content">
                      <h3>{property.title}</h3>
                      <p className="property-location">{property.city}</p>
                      <div className="property-details">
                        <span>{property.bedrooms} BHK</span>
                        <span>{property.bathrooms} Bath</span>
                        <span>{property.area} sq.ft</span>
                      </div>
                      <div className="property-bottom">
                        <strong>₹{Number(property.price).toLocaleString("en-IN")}</strong>
                        <span>{property.listing_type === "SALE" ? "For sale" : "For rent"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Home;