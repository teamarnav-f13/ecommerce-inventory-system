import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, getCurrentVendorId } from "../services/api";
import { Plus, ArrowLeft } from "lucide-react";

function ManageSKUs() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setLoading(true);
      const response = await productAPI.listProductSKUs(productId);
      setSkus(response.skus || []);
    } catch (error) {
      console.error("Error loading SKUs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSKU = async () => {
    try {
      const vendorId = await getCurrentVendorId();

      await productAPI.createSKU(productId, {
        vendor_id: vendorId,
        variant_name: "New Variant",
        variant_attributes: {},
        unit_price: 0,
        current_stock: 0,
        reorder_threshold: 10
      });

      alert("SKU created");
      loadSKUs();
    } catch (error) {
      alert("Failed to create SKU");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading SKUs...</p>;

  return (
    <div style={{ padding: 30 }}>
      <button onClick={() => navigate("/catalog")}>
        <ArrowLeft size={18} /> Back
      </button>

      <h2>Manage SKUs for {productId}</h2>

      <button onClick={handleCreateSKU}>
        <Plus size={18} /> Add SKU
      </button>

      {skus.length === 0 ? (
        <p>No SKUs found.</p>
      ) : (
        <table style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Variant</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => (
              <tr key={sku.sku}>
                <td>{sku.sku}</td>
                <td>{sku.variant_name}</td>
                <td>{sku.current_stock}</td>
                <td>${sku.unit_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageSKUs;
