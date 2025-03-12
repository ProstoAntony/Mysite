import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const api = useAxios();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders/');
            console.log('Orders response:', response.data); // Для отладки
            const ordersData = Array.isArray(response.data) ? response.data : [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        }
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <div className="alert alert-info">No orders found</div>
            ) : (
                <div className="row">
                    {orders.map((order) => (
                        <div key={order.id} className="col-12 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        Order #{order.id}
                                        <span className="badge bg-primary ms-2">{order.status}</span>
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Order Details</h6>
                                            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                            <p>Total: ${order.total_amount}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Shipping Address</h6>
                                            <p>
                                                {order.shipping_address?.street_address}<br />
                                                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}<br />
                                                {order.shipping_address?.country}
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
                                                {order.items?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.product.name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${item.price}</td>
                                                        <td>${item.quantity * item.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Order;
