import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProperties } from "../services/api";

const API_BASE_URL = "http://127.0.0.1:8000";

function Properties() {
  const [properties, setProperties] = useState([]);

  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProperties({}, 1);
  }, []);

  const loadProperties = async (filters = activeFilters, requestedPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const data = await getProperties({ ...filters, sort, page: requestedPage, page_size: 9 });
      setProperties(Array.isArray(data) ? data : data.results || []);
      setTotal(Array.isArray(data) ? data.length : data.count || 0);
      setTotalPages(Array.isArray(data) ? 1 : data.total_pages || 1);
      setPage(Array.isArray(data) ? 1 : data.page || requestedPage);
    } catch (err) {
      console.error("Property loading error:", err);
      setError(err.message || "Unable to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters = {};

    if (city.trim()) {
      filters.city = city.trim();
    }

    if (listingType) {
      filters.listing_type = listingType;
    }

    if (propertyType) {
      filters.property_type = propertyType;
    }

    if (bedrooms) {
      filters.bedrooms = bedrooms;
    }

    if (minPrice) {
      filters.min_price = minPrice;
    }

    if (maxPrice) {
      filters.max_price = maxPrice;
    }

    setActiveFilters(filters);
    loadProperties(filters, 1);
  };

  const clearFilters = () => {
    setCity("");
    setListingType("");
    setPropertyType("");
    setBedrooms("");
    setMinPrice("");
    setMaxPrice("");
    setActiveFilters({});
    loadProperties({}, 1);
  };

  const getImageUrl = (property) => {
    if (
      property.images &&
      property.images.length > 0 &&
      property.images[0].image
    ) {
      return `${API_BASE_URL}${property.images[0].image}`;
    }

    return null;
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background: "#f7f7f7",
          paddingBottom: "60px",
        }}
      >
        {/* PAGE HEADER */}

        <section
          style={{
            background: "white",
            padding: "45px 20px 30px",
            textAlign: "center",
            borderBottom: "1px solid #eee",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            Properties
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "17px",
            }}
          >
            Find your perfect property without brokerage
          </p>
        </section>

        {/* FILTER SECTION */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "30px auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                marginBottom: "20px",
              }}
            >
              Search Properties
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >
              {/* CITY */}

              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />

              <select value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
                <option value="newest">Newest first</option>
                <option value="price_low_to_high">Price: low to high</option>
                <option value="price_high_to_low">Price: high to low</option>
              </select>

              {/* LISTING TYPE */}

              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                style={inputStyle}
              >
                <option value="">Buy / Rent</option>
                <option value="SALE">Buy</option>
                <option value="RENT">Rent</option>
              </select>

              {/* PROPERTY TYPE */}

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={inputStyle}
              >
                <option value="">Property Type</option>
                <option value="FLAT">Flat</option>
                <option value="HOUSE">House</option>
                <option value="PG">PG</option>
              </select>

              {/* BEDROOMS */}

              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                style={inputStyle}
              >
                <option value="">Bedrooms</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>

              {/* MIN PRICE */}

              <input
                type="number"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={inputStyle}
              />

              {/* MAX PRICE */}

              <input
                type="number"
                placeholder="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleSearch}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "13px 30px",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                style={{
                  background: "white",
                  color: "#333",
                  border: "1px solid #ddd",
                  padding: "13px 30px",
                  borderRadius: "6px",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {/* PROPERTY RESULTS */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
              }}
            >
              Available Properties
            </h2>

            {!loading && (
              <span
                style={{
                  color: "#666",
                }}
              >
                {total} properties found
              </span>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#666",
              }}
            >
              Loading properties...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div
              style={{
                background: "#fff",
                padding: "30px",
                textAlign: "center",
                borderRadius: "10px",
                color: "#d63031",
              }}
            >
              {error}
            </div>
          )}

          {/* NO RESULTS */}

          {!loading && !error && properties.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "50px",
                textAlign: "center",
                borderRadius: "10px",
              }}
            >
              <h3>No properties found</h3>

              <p
                style={{
                  color: "#777",
                  marginTop: "10px",
                }}
              >
                Try changing your search filters.
              </p>
            </div>
          )}

          {/* PROPERTY GRID */}

          {!loading && !error && properties.length > 0 && (
            <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "25px",
              }}
            >
              {properties.map((property) => {
                const imageUrl = getImageUrl(property);

                return (
                  <Link
                    to={`/properties/${property.id}`}
                    key={property.id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 18px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {/* PROPERTY IMAGE */}

                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        background: "#eee",
                        overflow: "hidden",
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "50px",
                          }}
                        >
                          🏠
                        </div>
                      )}
                    </div>

                    {/* PROPERTY DETAILS */}

                    <div
                      style={{
                        padding: "20px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "21px",
                          marginBottom: "12px",
                        }}
                      >
                        {property.title}
                      </h3>

                      <p
                        style={{
                          color: "#666",
                          marginBottom: "15px",
                        }}
                      >
                        📍 {property.city}
                      </p>

                      {/* PROPERTY FEATURES */}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "18px",
                        }}
                      >
                        <span style={badgeStyle}>
                          {property.bedrooms} BHK
                        </span>

                        <span style={badgeStyle}>
                          {property.bathrooms} Bath
                        </span>

                        <span style={badgeStyle}>
                          {property.area} sq.ft
                        </span>
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "15px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "22px",
                          }}
                        >
                          ₹
                          {Number(
                            property.price
                          ).toLocaleString("en-IN")}
                        </strong>

                        <span
                          style={{
                            color: "#e74c3c",
                            fontWeight: "600",
                          }}
                        >
                          {property.listing_type === "SALE"
                            ? "For Sale"
                            : "For Rent"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "30px" }}>
                <button onClick={() => loadProperties(activeFilters, page - 1)} disabled={page === 1} style={paginationButtonStyle}>Previous</button>
                <span style={{ color: "#666" }}>Page {page} of {totalPages}</span>
                <button onClick={() => loadProperties(activeFilters, page + 1)} disabled={page === totalPages} style={paginationButtonStyle}>Next</button>
              </div>
            )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "15px",
  outline: "none",
  background: "white",
};

const badgeStyle = {
  background: "#f7f7f7",
  padding: "8px 12px",
  borderRadius: "5px",
  color: "#555",
  fontSize: "14px",
};

const paginationButtonStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "white",
  color: "#333",
  cursor: "pointer",
  padding: "10px 16px",
};

export default Properties;
