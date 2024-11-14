// app/frontend/src/components/ImageUpload.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://13.61.25.188:3000/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      await axios.post('http://13.61.25.188:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchImages();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

      <h2>Uploaded Images</h2>
      <div>
        {images.map((image) => (
          <div key={image.imageId}>
            <img src={image.url} alt={image.title} style={{ width: '200px', height: '200px' }} />
            <p>{image.title}</p>
            <p>{image.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
