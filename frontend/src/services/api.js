// API service file
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR-API-ID.execute-api.ap-south-1.amazonaws.com/prod';

async function apiRequest(endpoint, options = {}) {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const config = {
      ...options,
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    console.log(`🔗 API Request: ${API_BASE_URL}${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

export async function getCurrentVendorId() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.payload['custom:vendor_id'] || 
           session.tokens?.idToken?.payload?.sub;
  } catch (error) {
    console.error('Error getting vendor ID:', error);
    return null;
  }
}

export const productAPI = {
  createProduct: async (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  getProduct: async (productId) => {
    return apiRequest(`/products/${productId}`);
  },

  updateProduct: async (productId, productData) => {
    return apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (productId, vendorId) => {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
      body: JSON.stringify({ vendor_id: vendorId })
    });
  },

  listVendorProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  createSKU: async (productId, skuData) => {
    return apiRequest(`/products/${productId}/skus`, {
      method: 'POST',
      body: JSON.stringify(skuData)
    });
  },

  updateSKU: async (productId, sku, skuData) => {
    return apiRequest(`/products/${productId}/skus/${sku}`, {
      method: 'PUT',
      body: JSON.stringify(skuData)
    });
  },

  listProductSKUs: async (productId) => {
    return apiRequest(`/products/${productId}/skus`);
  },

  // ⭐ NEW: Image upload methods
  uploadImage: async (productId, imageFile, vendorId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Image = reader.result.split(',')[1];
          
          const response = await apiRequest(`/products/${productId}/images/upload`, {
            method: 'POST',
            body: JSON.stringify({
              vendor_id: vendorId,
              image_data: base64Image,
              image_name: imageFile.name,
              content_type: imageFile.type
            })
          });
          
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  },

  uploadMultipleImages: async (productId, imageFiles, vendorId) => {
    const uploadPromises = Array.from(imageFiles).map(file => 
      productAPI.uploadImage(productId, file, vendorId)
    );
    return Promise.all(uploadPromises);
  }
};

export const inventoryAPI = {
  getInventory: async (productId, sku) => {
    return apiRequest(`/inventory/${productId}/skus/${sku}`);
  },

  getVendorInventory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory?${queryString}`);
  },

  getLowStockItems: async (vendorId) => {
    return apiRequest(`/inventory/low-stock?vendor_id=${vendorId}`);
  },

  adjustStock: async (productId, sku, adjustmentData) => {
    return apiRequest(`/inventory/${productId}/skus/${sku}/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData)
    });
  },

  getStockHistory: async (productId, sku, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory/${productId}/skus/${sku}/history?${queryString}`);
  },

  getVendorStats: async (vendorId) => {
    try {
      const inventoryData = await inventoryAPI.getVendorInventory({ vendor_id: vendorId });
      const products = await productAPI.listVendorProducts({ vendor_id: vendorId });
      const lowStock = await inventoryAPI.getLowStockItems(vendorId);

      const totalSKUs = inventoryData.inventory?.length || 0;
      const totalProducts = products.products?.length || 0;
      const lowStockItems = lowStock.items?.length || 0;
      const outOfStock = inventoryData.inventory?.filter(item => item.current_stock === 0).length || 0;

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

export const orderAPI = {
  processOrderPlaced: async (orderData) => {
    return apiRequest('/orders/placed', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  processOrderConfirmed: async (orderData) => {
    return apiRequest('/orders/confirmed', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  processOrderCancelled: async (orderData) => {
    return apiRequest('/orders/cancelled', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  processRefund: async (refundData) => {
    return apiRequest('/orders/refunded', {
      method: 'POST',
      body: JSON.stringify(refundData)
    });
  }
};

export const transactionAPI = {
  getHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions?${queryString}`);
  }
};

export const vendorAPI = {
  getProfile: async () => {
    return apiRequest('/vendor/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/vendor/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};

export default {
  productAPI,
  inventoryAPI,
  orderAPI,
  transactionAPI,
  vendorAPI,
  getCurrentVendorId
};
