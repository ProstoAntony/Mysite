import React, { useState, useEffect, useContext } from 'react';
import useAxios from '../utils/useAxios';
import { FaShoppingBag, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSpinner, FaBox, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import '../styles/support-page.css'; // Используем те же стили
import { toast, Toaster } from 'react-hot-toast';

const styles = {
  gameKeyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '8px',
    padding: '12px',
    margin: '8px 0',
    border: '1px solid rgba(40, 167, 69, 0.5)'
  },
  keyCode: {
    fontFamily: 'monospace',
    fontSize: '1.1em',
    letterSpacing: '1px',
    color: '#28a745'
  },
  copyButton: {
    backgroundColor: 'transparent',
    border: '1px solid #28a745',
    color: '#28a745',
    padding: '4px 12px',
    borderRadius: '4px',
    transition: 'all 0.3s ease'
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '8px',
    padding: '12px 20px'
  }
};

const Purchases = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5); // Увеличиваем количество заказов на странице до 5
  const [expandedOrder, setExpandedOrder] = useState(null);
  const api = useAxios();

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        if (!user) {
          console.log('No user found in context, cannot fetch orders');
          setError('You must be logged in to view orders');
          setLoading(false);
          return;
        }

        const response = await api.get('/orders/');
        console.log('Полный ответ API:', response);
        console.log('Данные заказов:', response.data);
        
        if (response.data && response.data.results) {
          response.data.results.forEach(order => {
            console.log(`Заказ ${order.id}:`, {
              payment_status: order.payment_status,
              items_count: order.order_items?.length,
              items: order.order_items
            });
          });
        }
        
        // Handle different response structures
        let orderData;
        if (response.data && typeof response.data === 'object') {
          orderData = Array.isArray(response.data) ? response.data :
                     Array.isArray(response.data.results) ? response.data.results :
                     Object.values(response.data);
        } else {
          orderData = [];
        }
        
        // Логируем обработанные данные
        console.log('Processed Orders:', orderData);
        console.log('Number of orders found:', orderData.length);
        
        if (orderData.length === 0) {
          console.log('No orders found. Check if user is properly authenticated and has orders.');
        } else {
          // Проверяем структуру первого заказа
          console.log('First order structure:', orderData[0]);
          console.log('Customer ID in first order:', orderData[0]?.customer);
          console.log('Current user ID:', user?.user_id);
          
          // Фильтруем заказы, чтобы показать только те, которые принадлежат текущему пользователю
          // Это дополнительная проверка на случай, если бэкенд возвращает заказы других пользователей
          if (user && user.user_id) {
            console.log('Filtering orders for current user ID:', user.user_id);
            const filteredOrders = orderData.filter(order => {
              const isCustomerOrder = order.customer === user.user_id;
              const isVendorOrder = order.vendor && Array.isArray(order.vendor) && order.vendor.includes(user.user_id);
              console.log(`Order ${order.id}: customer=${order.customer}, isCustomerOrder=${isCustomerOrder}, isVendorOrder=${isVendorOrder}`);
              return isCustomerOrder || isVendorOrder;
            });
            console.log('Filtered orders count:', filteredOrders.length);
            orderData = filteredOrders;
          }
        }
        
        setOrders(orderData);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching orders:', err);
          // Добавляем больше информации об ошибке
          let errorMessage = 'Failed to load orders. Please try again later.';
          if (err.response) {
            console.log('Error response:', err.response);
            console.log('Error response data:', err.response.data);
            errorMessage += ` Server responded with status ${err.response.status}.`;
          } else if (err.request) {
            console.log('Error request:', err.request);
            errorMessage += ' No response received from server.';
          } else {
            console.log('Error message:', err.message);
            errorMessage += ` Error: ${err.message}`;
          }
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]); // Добавляем user в зависимости, чтобы перезагружать заказы при изменении пользователя

  // Получаем текущие заказы для пагинации
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = Array.isArray(orders) ? orders.slice(indexOfFirstOrder, indexOfLastOrder) : [];
  
  // Общее количество страниц
  const totalPages = Array.isArray(orders) ? Math.ceil(orders.length / ordersPerPage) : 0;

  // Обработчик изменения страницы
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Прокрутка страницы вверх при смене страницы
    window.scrollTo(0, 0);
  };

  // Функция для отображения статуса заказа с иконкой
  const renderOrderStatus = (status) => {
    // Check if status is undefined or null
    if (!status) {
      return <span className="badge bg-secondary"><FaSpinner /> Pending</span>;
    }
    
    switch(status.toLowerCase()) {
      case 'completed':
        return <span className="badge bg-success"><FaCheckCircle /> Completed</span>;
      case 'processing':
        return <span className="badge bg-warning text-dark"><FaSpinner /> Processing</span>;
      case 'shipped':
        return <span className="badge bg-info"><FaTruck /> Shipped</span>;
      case 'cancelled':
        return <span className="badge bg-danger"><FaTimesCircle /> Cancelled</span>;
      case 'pending':
      default:
        return <span className="badge bg-secondary"><FaSpinner /> Pending</span>;
    }
  };

  // Функция для отображения статуса оплаты с иконкой
  const renderPaymentStatus = (status) => {
    if (!status) return null;
    
    switch(status.toLowerCase()) {
      case 'paid':
        return <span className="badge bg-success"><FaCheckCircle /> PAID</span>;
      case 'processing':
        return <span className="badge bg-warning text-dark"><FaSpinner /> PROCESSING</span>;
      case 'failed':
        return <span className="badge bg-danger"><FaTimesCircle /> FAILED</span>;
      default:
        return <span className="badge bg-secondary">{status.toUpperCase()}</span>;
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Функция для переключения развернутого состояния заказа
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const copyKeyToClipboard = (key) => {
    try {
      navigator.clipboard.writeText(key);
      toast.success('Ключ успешно скопирован!', {
        duration: 3000,
        position: 'top-right',
      });
    } catch (error) {
      toast.error('Не удалось скопировать ключ', {
        duration: 3000,
        position: 'top-right',
      });
      console.error('Error copying key:', error);
    }
  };

  if (loading) return (
    <div className="gaming-form d-flex justify-content-center align-items-center" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh'
    }}>
      <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="gaming-form d-flex align-center justify-center" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <div className="gaming-form__container" style={{ maxWidth: '800px', width: '90%', padding: '2.5rem' }}>
        <h1 className="gaming-form__title">Error</h1>
        <div className="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.7)', borderRadius: '5px', padding: '15px' }}>
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );
  
  if (!orders || orders.length === 0) {
    return (
      <div className="gaming-form d-flex align-center justify-center" style={{ 
        backgroundImage: 'url("/images/Background 12.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px 0'
      }}>
        <div className="gaming-form__container" style={{ maxWidth: '800px', width: '90%', padding: '2.5rem' }}>
          <h1 className="gaming-form__title">Your Orders</h1>
          <p className="gaming-form__subtitle">No orders found</p>
          <div className="alert" style={{ 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff',
            backdropFilter: 'blur(3px)',
            marginBottom: '1.5rem',
            padding: '1rem'
          }}>
            <p className="mb-0">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gaming-form" style={{ 
        backgroundImage: 'url("/images/Background 12.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div className="container-fluid py-5">
          <div className="gaming-form__container" style={{ 
            padding: '2.5rem', 
            marginBottom: '2rem',
            maxWidth: '1400px'
          }}>
            <div className="row mb-4">
              <div className="col">
                <h1 className="gaming-form__title">
                  <FaShoppingBag className="me-2" />
                  Your Orders ({orders.length} total)
                </h1>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="gaming-form__subtitle mb-0">Track and manage your purchases</p>
                  <div className="d-flex align-items-center">
                    <span className="text-light me-3">
                      Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} of {orders.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              {Array.isArray(currentOrders) && currentOrders.map(order => (
                <div key={order.id} className="col-12 mb-4">
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(33, 150, 243, 0.4) 100%)',
                      padding: '15px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h5 className="mb-0 text-white">
                        <FaBox className="me-2" />
                        Order #{order.id}
                      </h5>
                      <button 
                        className="gaming-form__button"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <div className="row text-white">
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="d-flex align-items-center mb-2">
                            <FaCalendarAlt className="text-info me-2" />
                            <div>
                              <small className="text-muted d-block">Order Date</small>
                              <strong>{formatDate(order.created_at)}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-2">
                              {renderOrderStatus(order.status)}
                            </div>
                            <div>
                              <small className="text-muted d-block">Order Status</small>
                              <strong>{order.status || 'Pending'}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="d-flex align-items-center mb-2">
                            <FaMoneyBillWave className="text-success me-2" />
                            <div>
                              <small className="text-muted d-block">Total Amount</small>
                              <strong>${
                                typeof order.total === 'number' ? order.total.toFixed(2) : 
                                typeof order.amount === 'number' ? order.amount.toFixed(2) :
                                typeof order.price === 'number' ? order.price.toFixed(2) :
                                parseFloat(order.total || order.amount || order.price || 0).toFixed(2)
                              }</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row mt-3 text-white">
                        <div className="col-md-6">
                          {order.payment_status && (
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {renderPaymentStatus(order.payment_status)}
                              </div>
                              <div>
                                <small className="text-muted">Payment Status</small>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 text-md-end">
                          {order.status === 'pending' && order.payment_url && (
                            <a 
                              href={order.payment_url} 
                              className="gaming-form__button filled"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!order.payment_url.includes('paypal.com')) {
                                  e.preventDefault();
                                  alert('Payment URL is invalid. Please contact support.');
                                }
                              }}
                            >
                              Complete Payment with PayPal
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Order Details */}
                      {expandedOrder === order.id && (
                        <div className="mt-4 pt-3 border-top border-secondary text-white">
                          <h6 className="fw-bold mb-3">Order Details</h6>
                          
                          {/* Shipping Information */}
                          {order.shipping_address && (
                            <div className="mb-4">
                              <h6 className="text-muted mb-2"><FaMapMarkerAlt className="me-2" />Shipping Address</h6>
                              <div className="card bg-light">
                                <div className="card-body py-2">
                                  <p className="mb-0">
                                    {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Order Items */}
                          {order.order_items && order.order_items.length > 0 && (
                            <div>
                              <h6 className="text-muted mb-2">Items in Your Order</h6>
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Product</th>
                                      <th>Quantity</th>
                                      <th>Price</th>
                                      <th>Subtotal</th>
                                      <th>Game Key</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.order_items.map(item => {
                                      console.log('Rendering item:', item);
                                      console.log('Order full data:', order);
                                      console.log('Order items length:', order.order_items?.length);
                                      console.log('First item if exists:', order.order_items?.[0]);
                                      return (
                                        <tr key={item.id}>
                                          <td>{item.product?.name || `Product #${item.product}`}</td>
                                          <td>{item.qty}</td>
                                          <td>${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}</td>
                                          <td>${typeof item.price === 'number' ? (item.price * item.qty).toFixed(2) : (parseFloat(item.price || 0) * item.qty).toFixed(2)}</td>
                                          <td>
                                            {(order.payment_status === 'Paid' || order.payment_status === 'PAID' || order.payment_status === 'paid') ? (
                                              item.game_key ? (
                                                <div className="d-flex align-items-center">
                                                  <div className="game-key-container p-2 bg-dark rounded">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                      <code className="text-success me-2">{item.game_key.key}</code>
                                                      <button 
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => {
                                                          copyKeyToClipboard(item.game_key.key);
                                                        }}
                                                      >
                                                        <i className="fas fa-copy me-1"></i>
                                                        Копировать
                                                      </button>
                                                    </div>
                                                    <small className="text-muted d-block mt-2">
                                                      <i className="fas fa-info-circle me-1"></i>
                                                      Активируйте ключ в вашем аккаунте Steam
                                                    </small>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="alert alert-warning p-2 mb-0">
                                                  <i className="fas fa-clock me-2"></i>
                                                  Ключ будет доступен в ближайшее время
                                                </div>
                                              )
                                            ) : (
                                              <div className="alert alert-secondary p-2 mb-0">
                                                <i className="fas fa-lock me-2"></i>
                                                Доступно после оплаты
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot className="table-light">
                                    <tr>
                                      <td colSpan="3" className="text-end">Subtotal:</td>
                                      <td>${parseFloat(order.sub_total || 0).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan="3" className="text-end">Shipping:</td>
                                      <td>${parseFloat(order.shipping || 0).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan="3" className="text-end fw-bold">Total:</td>
                                      <td className="fw-bold">${
                                        (parseFloat(order.sub_total || 0) + parseFloat(order.shipping || 0)).toFixed(2)
                                      }</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>

                              {/* Game Keys Section */}
                              {order.payment_status === 'Paid' && (
                                <div className="mt-4">
                                  <h6 className="text-muted mb-3">Ваши игровые ключи</h6>
                                  <div className="row g-3">
                                    {order.order_items.map(item => (
                                      item.game_key ? (
                                        <div key={item.id} className="col-md-6">
                                          <div className="card bg-dark border-success">
                                            <div className="card-body">
                                              <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title text-light mb-0">
                                                  {item.product?.name || `Product #${item.product}`}
                                                </h6>
                                                <span className="badge bg-success">Активен</span>
                                              </div>
                                              <div className="key-container p-2 bg-black rounded">
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <code className="text-success fs-5">{item.game_key}</code>
                                                  <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => {
                                                      copyKeyToClipboard(item.game_key);
                                                    }}
                                                  >
                                                    <i className="fas fa-copy me-1"></i>
                                                    Копировать
                                                  </button>
                                                </div>
                                              </div>
                                              <small className="text-muted d-block mt-2">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Активируйте ключ в вашем аккаунте Steam
                                              </small>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Order Timeline */}
                          <div className="mt-4">
                            <h6 className="mb-3" style={{ color: '#ccc' }}>Order Timeline</h6>
                            <div className="timeline">
                              <div className="timeline-item">
                                <div className="timeline-marker bg-success"></div>
                                <div className="timeline-content">
                                  <h6 className="mb-0">Order Placed</h6>
                                  <p className="text-muted small mb-0">{formatDate(order.created_at)}</p>
                                </div>
                              </div>
                              {order.payment_status === 'Paid' && (
                                <div className="timeline-item">
                                  <div className="timeline-marker bg-primary"></div>
                                  <div className="timeline-content">
                                    <h6 className="mb-0"><FaMoneyBillWave className="me-2" />Payment Completed</h6>
                                    <p className="text-muted small mb-0">Payment confirmed via {order.payment_method}</p>
                                  </div>
                                </div>
                              )}
                              {order.status !== 'pending' && (
                                <div className="timeline-item">
                                  <div className={`timeline-marker ${order.status === 'processing' ? 'bg-warning' : 'bg-secondary'}`}></div>
                                  <div className="timeline-content">
                                    <h6 className="mb-0">Processing</h6>
                                    <p className="text-muted small mb-0">Your order is being processed</p>
                                  </div>
                                </div>
                              )}
                              {order.status === 'shipped' && (
                                <div className="timeline-item">
                                  <div className="timeline-marker bg-info"></div>
                                  <div className="timeline-content">
                                    <h6 className="mb-0">Shipped</h6>
                                    <p className="text-muted small mb-0">Your order has been shipped</p>
                                  </div>
                                </div>
                              )}
                              {order.status === 'completed' && (
                                <div className="timeline-item">
                                  <div className="timeline-marker bg-success"></div>
                                  <div className="timeline-content">
                                    <h6 className="mb-0">Delivered</h6>
                                    <p className="text-muted small mb-0">Your order has been delivered</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )} 
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Обновленная пагинация */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  {/* Кнопка First */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px'
                      }}
                    >
                      First
                    </button>
                  </li>

                  {/* Кнопка Previous */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px'
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>

                  {/* Номера страниц */}
                  {[...Array(totalPages)].map((_, index) => {
                    // Показываем только ближайшие страницы к текущей
                    if (
                      index + 1 === 1 || // Первая страница
                      index + 1 === totalPages || // Последняя страница
                      (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2) // Ближайшие страницы
                    ) {
                      return (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(index + 1)}
                            style={{ 
                              backgroundColor: currentPage === index + 1 ? 'rgba(33, 150, 243, 0.8)' : 'rgba(0,0,0,0.7)', 
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              padding: '8px 16px'
                            }}
                          >
                            {index + 1}
                          </button>
                        </li>
                      );
                    } else if (
                      index + 1 === currentPage - 3 ||
                      index + 1 === currentPage + 3
                    ) {
                      // Добавляем многоточие
                      return (
                        <li key={index} className="page-item disabled">
                          <span 
                            className="page-link" 
                            style={{ 
                              backgroundColor: 'rgba(0,0,0,0.7)', 
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              padding: '8px 16px'
                            }}
                          >
                            ...
                          </span>
                        </li>
                      );
                    }
                    return null;
                  })}

                  {/* Кнопка Next */}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px'
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>

                  {/* Кнопка Last */}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px'
                      }}
                    >
                      Last
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );  
};  

export default Purchases;