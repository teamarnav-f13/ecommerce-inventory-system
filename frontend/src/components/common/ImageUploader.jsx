import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { productAPI, getCurrentVendorId } from 'frontend/src/services/API.js';

function ImageUploader({ productId, existingImages = [], onImagesUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + existingImages.length > 5) {
      alert('Maximum 5 images allowed per product');
      return;
    }
    
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPreviewImages(previews);
  };

  const handleUpload = async () => {
    if (previewImages.length === 0) return;
    
    try {
      setUploading(true);
      const vendorId = await getCurrentVendorId();
      
      const results = await productAPI.uploadMultipleImages(
        productId,
        previewImages.map(p => p.file),
        vendorId
      );
      
      console.log('✅ Images uploaded:', results);
      
      const newImageUrls = results.map(r => r.image_url);
      
      previewImages.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviewImages([]);
      
      if (onImagesUpdated) {
        onImagesUpdated([...existingImages, ...newImageUrls]);
      }
      
      alert(`${results.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (index) => {
    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  return (
    <div className="image-uploader">
      <h3>Product Images</h3>
      
      {existingImages.length > 0 && (
        <div className="existing-images">
          <p>Current images: {existingImages.length}/5</p>
          <div className="image-grid">
            {existingImages.map((url, idx) => (
              <div key={idx} className="image-preview">
                <img src={url} alt={`Product ${idx + 1}`} />
                <span>Image {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="upload-section">
        <label className="file-input-label">
          <Upload size={24} />
          <span>Choose Images</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || existingImages.length >= 5}
            style={{ display: 'none' }}
          />
        </label>
        <p className="upload-hint">
          Supports JPG, PNG, WebP. Max 5 images total.
        </p>
      </div>
      
      {previewImages.length > 0 && (
        <div className="preview-section">
          <h4>Selected Images ({previewImages.length})</h4>
          <div className="image-grid">
            {previewImages.map((preview, idx) => (
              <div key={idx} className="image-preview">
                <img src={preview.preview} alt={preview.name} />
                <button
                  className="remove-btn"
                  onClick={() => removePreview(idx)}
                  disabled={uploading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${previewImages.length} Image(s)`}
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
