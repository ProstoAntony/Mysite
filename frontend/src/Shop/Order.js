import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';
import { Link } from 'react-router-dom';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(2); // Показываем по 2 заказа на странице
    const api = useAxios();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/');
            console.log('Orders response:', response.data);
            const ordersData = Array.isArray(response.data) ? response.data : [];
            setOrders(ordersData);
            setError('');
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again later.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Get current orders for pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    
    // Общее количество страниц
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    // Переход на предыдущую страницу
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Переход на следующую страницу
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4">My Orders</h2>
            
            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : orders.length === 0 ? (
                <div className="alert alert-info">No orders found</div>
            ) : (
                <>
                    <div className="row">
                        {currentOrders.map((order) => (
                            <div key={order.id} className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            Order #{order.id}
                                            <span className={`badge ms-2 ${
                                                order.payment_status === 'Paid' ? 'bg-success' : 
                                                order.payment_status === 'Processing' ? 'bg-warning' :
                                                'bg-danger'
                                            }`}>
                                                {order.payment_status || 'Pending'}
                                            </span>
                                        </h5>
                                        <Link to={`/order/${order.id}`} className="btn btn-sm btn-primary">
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>Order Details</h6>
                                                <p>Date: {formatDate(order.created_at)}</p>
                                                <p>Total: ${parseFloat(order.total_price || 0).toFixed(2)}</p>
                                                <p>Payment Method: {order.payment_method || 'Not specified'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Shipping Address</h6>
                                                <p>
                                                    {order.full_name || 'Name not provided'}<br />
                                                    {order.address || 'Address not provided'}<br />
                                                    {order.city || 'City not provided'}, {order.postal_code || 'Postal code not provided'}<br />
                                                    {order.country || 'Country not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <h6 className="mt-3">Items</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.order_items && order.order_items.length > 0 ? (
                                                        order.order_items.map((item) => (
                                                            <tr key={item.id}>
                                                                <td>{item.product_name || 'Product'}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                                                                <td>${(item.quantity * parseFloat(item.price || 0)).toFixed(2)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No items found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Простая пагинация с кнопками Предыдущая/Следующая */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <button 
                                className="btn btn-outline-primary" 
                                onClick={goToPreviousPage} 
                                disabled={currentPage === 1}
                            >
                                Предыдущая
                            </button>
                            
                            <span>Страница {currentPage} из {totalPages}</span>
                            
                            <button 
                                className="btn btn-outline-primary" 
                                onClick={goToNextPage} 
                                disabled={currentPage === totalPages}
                            >
                                Следующая
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Order;
