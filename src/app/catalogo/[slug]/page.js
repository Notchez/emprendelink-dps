"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AccountActions } from "@/components/auth/AccountActions";
import { catalogService } from "@/services/catalogService";
import { useCart } from "@/hooks/useCart";

// --- Subcomponente 1: Tarjeta de Producto ---
function ProductCard({ product, onSelectDetail, onAddToCart }) {
  if (!product) return null;

  return (
    <article
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1.25rem",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div>
        <h3
          style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "#1a202c" }}
        >
          {product.name}
        </h3>
        <p
          style={{ fontSize: "0.875rem", color: "#4a5568", marginBottom: "1rem", lineHeight: 1.4 }}
        >
          {product.description || "Sin descripción disponible."}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "0.75rem",
          borderTop: "1px solid #edf2f7",
        }}
      >
        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2b6cb0" }}>
          ${Number(product.price || 0).toFixed(2)}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => onSelectDetail(product)}
            style={{
              backgroundColor: "#edf2f7",
              color: "#4a5568",
              border: "none",
              padding: "0.45rem 0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Ver detalle
          </button>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            style={{
              backgroundColor: "#3182ce",
              color: "#ffffff",
              border: "none",
              padding: "0.45rem 0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

// --- Subcomponente 2: Modal Detalle del Producto ---
function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "480px",
          width: "100%",
          padding: "1.5rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#1a202c" }}>{product.name}</h2>
        <p style={{ color: "#4a5568", lineHeight: 1.5 }}>{product.description}</p>
        <p style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#2b6cb0", margin: "1rem 0" }}>
          Precio: ${Number(product.price || 0).toFixed(2)}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <label htmlFor="modal-qty">
            <strong>Cantidad:</strong>
          </label>
          <input
            id="modal-qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{
              width: "65px",
              padding: "0.35rem",
              textAlign: "center",
              borderRadius: "4px",
              border: "1px solid #cbd5e0",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              background: "#e2e8f0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              padding: "0.5rem 1rem",
              background: "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponente 3: Drawer Lateral del Carrito ---
function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        maxWidth: "380px",
        backgroundColor: "#ffffff",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.15)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#1a202c" }}>Tu Carrito</h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.25rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#718096", marginTop: "2.5rem" }}>
            El carrito está vacío.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #edf2f7",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "0.95rem", color: "#2d3748" }}>
                  {item.name}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "#4a5568" }}>
                  ${Number(item.price || 0).toFixed(2)} c/u
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    padding: "0.2rem 0.55rem",
                    background: "#edf2f7",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: "22px", textAlign: "center", fontWeight: 600 }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    padding: "0.2rem 0.55rem",
                    background: "#edf2f7",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{
                    marginLeft: "0.5rem",
                    color: "#e53e3e",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div
          style={{ padding: "1rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f7fafc" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <strong>Subtotal:</strong>
            <strong style={{ color: "#2b6cb0", fontSize: "1.25rem" }}>
              ${subtotal.toFixed(2)}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/checkout");
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#38a169",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "0.5rem",
            }}
          >
            Continuar al Checkout
          </button>
          <button
            type="button"
            onClick={clearCart}
            style={{
              width: "100%",
              padding: "0.4rem",
              background: "transparent",
              border: "none",
              color: "#718096",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Vaciar Carrito
          </button>
        </div>
      )}
    </div>
  );
}

// --- Componente Principal de la Página ---
export default function CatalogPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addItem, totalItemsCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("cat_all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      setError(null);
      const res = await catalogService.getCatalogBySlug(slug);

      if (res.success && res.data) {
        setBusiness(res.data.business);
        setCategories(res.data.categories || []);
        setProducts(res.data.products || []);
      } else {
        setError(res.error?.message || "Error al cargar el catálogo");
      }
      setLoading(false);
    }

    if (slug) {
      loadCatalog();
    }
  }, [slug]);

  const filteredProducts = products.filter((prod) => {
    if (!prod.active) return false;
    const matchCat = selectedCategory === "cat_all" || prod.categoryId === selectedCategory;
    const matchQuery =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "1.5rem",
        background: "#fff",
        color: "#1f2937",
        colorScheme: "light",
      }}
    >
      <AccountActions />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#2b6cb0",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🛒 Ver Carrito ({totalItemsCount})
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#4a5568" }}>
          <p>Cargando catálogo del emprendimiento...</p>
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#fed7d7",
            color: "#c53030",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {!loading && !error && business && (
        <div>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "1rem",
            }}
          >
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl}
                alt={`Logotipo de ${business.name}`}
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "1px solid #e2e8f0",
                }}
              />
            ) : null}
            <div>
              <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", color: "#1a202c" }}>
                {business.name}
              </h1>
              <p style={{ color: "#718096", margin: 0 }}>Catálogo oficial de productos</p>
            </div>
          </header>

          <section style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: "1 1 250px",
                padding: "0.5rem 1rem",
                border: "1px solid #cbd5e0",
                borderRadius: "6px",
              }}
            />

            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </section>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#718096" }}>
              <p>No se encontraron productos disponibles en esta categoría o búsqueda.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectDetail={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => addItem(p, 1)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, q) => addItem(p, q)}
        />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
