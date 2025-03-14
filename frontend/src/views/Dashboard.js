import {useState, useEffect, useContext} from "react";
import useAxios from "../utils/useAxios";
import ProductList from "../Shop/ProductList";
import {jwtDecode, jwtDecode as jwt_decode} from "jwt-decode";
import { Link, Redirect } from "react-router-dom";
import { useCart } from '../context/CartContext';
import AuthContext from "../context/AuthContext";

function Dashboard() {
      const [res, setRes] = useState("");
      const api = useAxios();
      const token = localStorage.getItem("authTokens");
      const { cartItems } = useCart();
      const { user } = useContext(AuthContext);
      const [userData, setUserData] = useState({
        user_id: null,
        username: '',
        full_name: '',
        image: ''
      });
      const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        regular_price: '',
        category: '',
        stock: '',
        image: null,
        gallery: [] // Add gallery array for multiple images
      });
      const [categories, setCategories] = useState([]);
      const [successMessage, setSuccessMessage] = useState('');
      const [errorMessage, setErrorMessage] = useState('');
      const [showCategoryModal, setShowCategoryModal] = useState(false);
      const [newCategoryName, setNewCategoryName] = useState('');
      
      useEffect(() => {
        if (token) {
          try {
            const decode = jwt_decode(token);
            setUserData({
              user_id: decode.user_id,
              username: decode.username,
              full_name: decode.full_name,
              image: decode.image
            });
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        } else {
          console.error("Token is not defined or invalid.");
        }
      }, [token]);

      // Remove the test API call since it's not necessary
      useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.get("/test/");
            setRes(response.data.response);
          } catch (error) {
            console.log(error);
            setRes("Something went wrong");
          }
        };
        fetchData();
      }, []); // Remove api from dependencies

      useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await api.get('/categories/');
            console.log('Response status:', response.status); // Log response status
            console.log('Response data:', response.data); // Log response data
            const categoriesData = Array.isArray(response.data.results) ? response.data.results : [];
            console.log('Categories data:', categoriesData); // Log the categories data
            setCategories(categoriesData);
          } catch (error) {
            console.error('Error fetching categories:', error.response?.data || error);
            setCategories([]);
          }
        };
        fetchCategories();
      }, []);

      const handleProductChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
          setNewProduct(prev => ({
            ...prev,
            image: files[0]
          }));
        } else if (name === 'gallery') {
          setNewProduct(prev => ({
            ...prev,
            gallery: Array.from(files)
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            [name]: value
          }));
        }
      };

      const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Append main fields
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('price', newProduct.price);
        formData.append('regular_price', newProduct.regular_price);
        formData.append('category', newProduct.category);
        formData.append('stock', newProduct.stock);
        
        // Append image files
        if (newProduct.image) {
            formData.append('image', newProduct.image);
        }
        
        // Append gallery files with correct field name
        newProduct.gallery.forEach((file) => {
            formData.append('gallery', file);
        });
    
        try {
            const response = await api.post('/products/', formData);
          
          // Reset form
          setNewProduct({
            name: '',
            description: '',
            price: '',
            regular_price: '',
            category: '',
            stock: '',
            image: null,
            gallery: []
          });
          setSuccessMessage('Product created successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
          setErrorMessage('Error creating product. Please try again.');
          console.error('Error creating product:', error);
          setTimeout(() => setErrorMessage(''), 3000);
        }
      };

      const handleCreateCategory = async () => {
          try {
              // Создаем slug из названия категории (преобразуем в нижний регистр и заменяем пробелы на дефисы)
              const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
              
              console.log('Sending category data:', { title: newCategoryName, slug });
              
              // Добавляем slug в запрос
              const response = await api.post('/categories/', { 
                  title: newCategoryName,
                  slug: slug
              });
              
              console.log('Category created successfully:', response.data);
              
              // Обновим список категорий
              setCategories(prev => [...prev, response.data]);
              setShowCategoryModal(false);
              setNewCategoryName('');
              setNewProduct(prev => ({...prev, category: response.data.id}));
              
              // Покажем сообщение об успехе
              setSuccessMessage('Category created successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
          } catch (error) {
              console.error('Error creating category:', error);
              console.error('Error details:', error.response?.data);
              setErrorMessage('Failed to create category: ' + (JSON.stringify(error.response?.data) || 'Unknown error'));
              setTimeout(() => setErrorMessage(''), 5000);
          }
      };

      return (
          <div className="container-fluid" style={{ paddingTop: "100px" }}>
      <div className="row">
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
            <h1 className="h2">Admin Dashboard</h1>
          </div>
          <div className='alert alert-success'>
            <strong>{res}</strong>
          </div>
          <h2>Latest Products</h2>
          
        </main>
      </div>
            <div className="row">
                {/* Product Form - Left Side */}
                <div className="col-md-5">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">Add New Product</h4>
                        </div>
                        <div className="card-body">
                            {successMessage && (
                                <div className="alert alert-success">{successMessage}</div>
                            )}
                            {errorMessage && (
                                <div className="alert alert-danger">{errorMessage}</div>
                            )}
                            <form onSubmit={handleProductSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={newProduct.name}
                                        onChange={handleProductChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={newProduct.description}
                                        onChange={handleProductChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={newProduct.price}
                                        onChange={handleProductChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Regular Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="regular_price"
                                        value={newProduct.regular_price}
                                        onChange={handleProductChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <div className="d-flex">
                                        <select
                                            className="form-select me-2"
                                            name="category"
                                            value={newProduct.category}
                                            onChange={handleProductChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {Array.isArray(categories) && categories.map(category => (
                                              <option key={category.id} value={category.id}>
                                                {category.title}
                                              </option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-primary" 
                                            onClick={() => setShowCategoryModal(true)}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Stock</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="stock"
                                        value={newProduct.stock}
                                        onChange={handleProductChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="image"
                                        onChange={handleProductChange}
                                        accept="image/*"
                                        required
                                    />
                                </div>
                                {/* Add Gallery Images Field */}
                                <div className="mb-3">
                                    <label className="form-label">Gallery Images</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="gallery"
                                        onChange={handleProductChange}
                                        accept="image/*"
                                        multiple
                                    />
                                    <small className="text-muted">You can select multiple images for the gallery</small>
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Add Product
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Product List - Right Side */}
                <div className="col-md-7">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">Our Products</h4>
                        </div>
                        <div className="card-body">
                            <ProductList />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Модальное окно для создания категории */}
            {showCategoryModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Category</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Category Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleCreateCategory}
                                    disabled={!newCategoryName.trim()}
                                >
                                    Create Category
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;