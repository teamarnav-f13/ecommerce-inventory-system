import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tdozbknrj8.execute-api.ap-south-1.amazonaws.com/prod';

console.log('🔗 API Base URL:', API_BASE_URL);

async function apiRequest(endpoint, options = {}) {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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

    const data = responseText ? JSON.parse(responseText) : {};
    return data;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

export async function getCurrentVendorId() {
  try {
    const session = await fetchAuthSession();
    const userSub = session.tokens?.idToken?.payload?.sub;
    console.log('👤 Current User Sub:', userSub);
    return userSub || 'VENDOR-001';
  } catch (error) {
    console.error('Error getting vendor ID:', error);
    return 'VENDOR-001';
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
      console.log('📊 Fetching vendor stats for:', vendorId);
      
      const [productsResponse, inventoryResponse, lowStockResponse] = await Promise.all([
        productAPI.listVendorProducts({ vendor_id: vendorId, limit: 100 }),
        inventoryAPI.getVendorInventory({ vendor_id: vendorId, limit: 100 }),
        inventoryAPI.getLowStockItems(vendorId)
      ]);

      console.log('Products response:', productsResponse);
      console.log('Inventory response:', inventoryResponse);
      console.log('Low stock response:', lowStockResponse);

      const totalProducts = productsResponse?.products?.length || 0;
      const totalSKUs = inventoryResponse?.inventory?.length || 0;
      const lowStockItems = lowStockResponse?.items?.length || 0;
      const outOfStock = inventoryResponse?.inventory?.filter(item => item.current_stock === 0).length || 0;

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
