import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://tdozbknrj8.execute-api.ap-south-1.amazonaws.com/prod';

console.log('🔗 API Base URL:', API_BASE_URL);

/* ============================================
   CORE REQUEST HANDLER
============================================ */

async function apiRequest(endpoint, options = {}) {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📤 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    const responseText = await response.text();

    console.log(`📥 API Response Status: ${response.status}`);
    console.log(`📥 API Response Body:`, responseText);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${responseText}`);
    }

    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

/* ============================================
   AUTH HELPERS
============================================ */

export async function getCurrentVendorId() {
  try {
    const session = await fetchAuthSession();
    const userSub = session.tokens?.idToken?.payload?.sub;
    console.log('👤 Current User Sub:', userSub);
    return userSub;
  } catch (error) {
    console.error('Error getting vendor ID:', error);
    throw error;
  }
}

/* ============================================
   PRODUCT APIs
============================================ */

export const productAPI = {
  createProduct: (productData) =>
    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  getProduct: (productId) =>
    apiRequest(`/products/${productId}`),

  updateProduct: (productId, productData) =>
    apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  deleteProduct: async (productId) => {
    const vendorId = await getCurrentVendorId();
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
      body: JSON.stringify({ vendor_id: vendorId })
    });
  },

  listVendorProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  /* ==============================
     SKU MANAGEMENT
  ============================== */

  createSKU: async (productId, skuData) => {
    return apiRequest(`/products/${productId}/skus`, {
      method: 'POST',
      body: JSON.stringify(skuData)
    });
  },

  createMultipleSKUs: async (productId, skus = []) => {
    const results = [];
    for (const sku of skus) {
      const res = await productAPI.createSKU(productId, sku);
      results.push(res);
    }
    return results;
  },

  updateSKU: (productId, sku, skuData) =>
    apiRequest(`/products/${productId}/skus/${sku}`, {
      method: 'PUT',
      body: JSON.stringify(skuData)
    }),

  listProductSKUs: (productId) =>
    apiRequest(`/products/${productId}/skus`),

  /* ==============================
     IMAGE UPLOAD
  ============================== */

  uploadImage: async (productId, imageFile) => {
    const vendorId = await getCurrentVendorId();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64Image = reader.result.split(',')[1];

          const response = await apiRequest(
            `/products/${productId}/images/upload`,
            {
              method: 'POST',
              body: JSON.stringify({
                vendor_id: vendorId,
                image_data: base64Image,
                image_name: imageFile.name,
                content_type: imageFile.type
              })
            }
          );

          resolve(response);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () =>
        reject(new Error('Failed to read file'));

      reader.readAsDataURL(imageFile);
    });
  },

  uploadMultipleImages: async (productId, imageFiles) => {
    const uploads = Array.from(imageFiles).map((file) =>
      productAPI.uploadImage(productId, file)
    );
    return Promise.all(uploads);
  }
};

/* ============================================
   INVENTORY APIs
============================================ */

export const inventoryAPI = {
  getInventory: (productId, sku) =>
    apiRequest(`/inventory/${productId}/skus/${sku}`),

  getVendorInventory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory?${queryString}`);
  },

  getLowStockItems: (vendorId) =>
    apiRequest(`/inventory/low-stock?vendor_id=${vendorId}`),

  /* ============================================
     UPDATED STOCK ADJUSTMENT (FIXED)
  ============================================ */

  adjustStock: async (productId, sku, quantityChange) => {
    const vendorId = await getCurrentVendorId();

    const change = Number(quantityChange);

    if (isNaN(change) || change === 0) {
      throw new Error('Quantity change must be a non-zero number');
    }

    const transactionType =
      change > 0 ? 'STOCK_IN' : 'STOCK_OUT';

    return apiRequest(
      `/inventory/${productId}/skus/${sku}/adjust`,
      {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: vendorId,
          quantity_change: change,
          transaction_type: transactionType
        })
      }
    );
  },

  getStockHistory: (productId, sku, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/inventory/${productId}/skus/${sku}/history?${queryString}`
    );
  },

  /* ============================================
     VENDOR DASHBOARD STATS (RESTORED)
  ============================================ */

  getVendorStats: async (vendorId) => {
    try {
      const [productsResponse, inventoryResponse, lowStockResponse] =
        await Promise.all([
          productAPI.listVendorProducts({ vendor_id: vendorId, limit: 100 }),
          inventoryAPI.getVendorInventory({ vendor_id: vendorId, limit: 100 }),
          inventoryAPI.getLowStockItems(vendorId)
        ]);

      const totalProducts = productsResponse?.products?.length || 0;
      const totalSKUs = inventoryResponse?.inventory?.length || 0;
      const lowStockItems = lowStockResponse?.items?.length || 0;
      const outOfStock =
        inventoryResponse?.inventory?.filter(
          (item) => item.current_stock === 0
        ).length || 0;

      return {
        totalProducts,
        totalSKUs,
        lowStockItems,
        outOfStock
      };
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      return {
        totalProducts: 0,
        totalSKUs: 0,
        lowStockItems: 0,
        outOfStock: 0
      };
    }
  }
};

/* ============================================
   ORDER APIs
============================================ */

export const orderAPI = {
  processOrderPlaced: (orderData) =>
    apiRequest('/orders/placed', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  processOrderConfirmed: (orderData) =>
    apiRequest('/orders/confirmed', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  processOrderCancelled: (orderData) =>
    apiRequest('/orders/cancelled', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  processRefund: (refundData) =>
    apiRequest('/orders/refunded', {
      method: 'POST',
      body: JSON.stringify(refundData)
    })
};

/* ============================================
   EXPORT DEFAULT
============================================ */

export default {
  productAPI,
  inventoryAPI,
  orderAPI,
  getCurrentVendorId
};
