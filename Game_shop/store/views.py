from asyncio import exceptions
from urllib import response

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Variant, VariantItem, Cart, Order, Gallery, Review, Wishlist, GameKey
from .serializers import (
    CategorySerializer, ProductSerializer, VariantSerializer, 
    VariantItemSerializer, CartSerializer, OrderSerializer,
    GallerySerializer, ReviewSerializer, WishlistSerializer, GameKeySerializer
)
from django.db.models import F, Count
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from .models import Order, OrderItem, Product
import logging
import  requests

from django.conf import settings
from django.core.mail import send_mail

# Set up logging
logger = logging.getLogger(__name__)

# ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        try:
            return Category.objects.annotate(
                games_count=Count('product')
            ).order_by('title')
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.get_queryset: {str(e)}")
            return Category.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = Category.objects.all().order_by('title')
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            # Возвращаем данные в формате { results: [...] }
            return Response({
                'results': serializer.data
            })
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.list: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True)
    def products(self, request, pk=None):
        """Получить все игры в категории"""
        category = self.get_object()
        products = Product.objects.filter(
            category=category,
            status='Published'
        )
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(status='Published')
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(status='Published')
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class VariantViewSet(viewsets.ModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

class VariantItemViewSet(viewsets.ModelViewSet):
    queryset = VariantItem.objects.all()
    serializer_class = VariantItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['variant']

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
            
        if user.is_staff:
            # Администраторы видят все заказы
            logger.info(f"Admin user {user.username} accessing all orders")
            return Order.objects.all()
        
        # Фильтруем заказы по полю customer, которое есть в модели Order
        customer_orders = Order.objects.filter(customer=user)
        logger.info(f"User {user.username} (ID: {user.id}): Found {customer_orders.count()} orders with customer field")
        
        # Также проверяем, является ли пользователь продавцом (vendor) для каких-либо заказов
        vendor_orders = Order.objects.filter(vendor=user)
        logger.info(f"User {user.username} (ID: {user.id}): Found {vendor_orders.count()} orders as vendor")
        
        # Объединяем заказы, где пользователь является покупателем или продавцом
        combined_orders = customer_orders | vendor_orders
        
        return combined_orders.distinct()

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        order = self.get_object()
        
        try:
            # Проверяем оплату (здесь должна быть ваша логика проверки оплаты)
            payment_successful = True
            
            if payment_successful:
                # Обрабатываем каждый элемент заказа
                for order_item in order.orderitem_set.all():
                    # Пытаемся назначить ключ для каждого товара
                    if order_item.assign_game_key():
                        # Отправляем email с ключом
                        if order_item.game_key:
                            send_game_key_email(
                                order.customer.email,
                                order_item.product.name,
                                order_item.game_key.key
                            )
                    else:
                        # Если ключей нет в наличии
                        return Response(
                            {'error': f'No keys available for {order_item.product.name}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Обновляем статус заказа
                order.payment_status = 'Paid'
                order.order_status = 'Fulfilled'
                order.save()
                
                # Возвращаем обновленные данные заказа
                serializer = self.get_serializer(order)
                return Response(serializer.data)
            
            return Response(
                {'error': 'Payment failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(active=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'rating']

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            # Получаем ID продукта из запроса
            product_id = request.data.get('product')
            
            # Проверяем существование продукта
            product = Product.objects.get(id=product_id)
            
            # Проверяем, существует ли уже такая запись
            wishlist_item, created = Wishlist.objects.get_or_create(
                user=request.user,
                product=product
            )
            
            serializer = self.get_serializer(wishlist_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

def clear_cart_items(request):
    try:
        cart_id = request.session.get('card_id')  # Исправлено с [] на ()
        Cart.objects.filter(cart_id=cart_id).delete()  # Исправлено с store_models и card_id
    except Exception as e:
        logger.error(f"Error clearing cart: {e}")
    return

def get_paypal_accsess_token():
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}  # Исправлено с set на dict
    auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET_ID)  # Исправлено с set на tuple
    response = requests.post(token_url, data=data, auth=auth)  # Исправлено с request на response

    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"failed to get access token from PayPal. Status code: {response.status_code}")

def paypal_payment_verify(request, order_id):
    order = Order.objects.get(id=order_id)  # Исправлено с store_models.Order и order_id
    transaction_id = request.GET.get("transaction_id")  # Исправлено с Get на GET
    paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{transaction_id}"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {get_paypal_accsess_token()}"
    }
    response = requests.get(paypal_api_url, headers=headers)

    if response.status_code == 200:
        paypal_order_data = response.json()
        paypal_payment_status = paypal_order_data['status']
        payment_method = "PayPal"
        if paypal_payment_status == "COMPLETED":
            if order.payment_status == "Processing":
                order.payment_status = "Paid"
                order.payment_method = payment_method
                order.save()
                clear_cart_items(request)
                return redirect(f"/payment_status/{order.order_id}/payment_status=paid")
    else:
        return redirect(f"/payment_status/{order.order_id}/payment_status=filed")

def payment_status(request, order_id):
    try:
        # Пробуем найти заказ по id
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        try:
            # Если не нашли, пробуем по order_id
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=404)
        except Exception as e:
            logger.error(f"Error finding order: {e}")
            return JsonResponse({'error': 'Server error'}, status=500)
    except Exception as e:
        logger.error(f"Error finding order: {e}")
        return JsonResponse({'error': 'Server error'}, status=500)

    context = {
        'order': order,
    }
    return render(request, 'store/payment_status.html', context)

# API Views
@api_view(['GET'])
def get_discounted_products(request):
    discounted_products = Product.objects.filter(
        regular_price__gt=F('price'),
        status="Published"
    ).order_by('-regular_price')[:10]  # Limit to 10 products for the slider

    serializer = ProductSerializer(discounted_products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order with server-side price calculations"""
    data = request.data
    user = request.user if request.user.is_authenticated else None
    
    logger.info(f"Creating order for user: {user.username} (ID: {user.id})")
    
    # Extract order items data
    order_items_data = data.get('order_items', [])
    
    if not order_items_data:
        return Response({"detail": "No order items provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate order totals
    try:
        # Initialize totals
        subtotal = 0
        shipping_cost = 0
        
        # Validate and calculate totals for each item
        validated_items = []
        for item_data in order_items_data:
            product_id = item_data.get('product')
            quantity = int(item_data.get('quantity', 1))
            
            try:
                product = Product.objects.get(id=product_id)
                
                # Calculate item price and shipping
                item_price = float(product.price)
                item_shipping = float(product.shipping or 0)
                
                # Add to totals
                item_subtotal = item_price * quantity
                item_shipping_total = item_shipping * quantity
                
                subtotal += item_subtotal
                shipping_cost += item_shipping_total
                
                validated_items.append({
                    'product': product,
                    'quantity': quantity,
                    'price': item_price,
                    'subtotal': item_subtotal,
                    'shipping': item_shipping_total
                })
                
            except Product.DoesNotExist:
                return Response({"detail": f"Product with ID {product_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                return Response({"detail": f"Invalid quantity or price for product {product_id}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate tax and service fee
        tax_rate = 0.10  # 10% tax rate
        service_fee_rate = 0.05  # 5% service fee
        
        tax = round(subtotal * tax_rate, 2)
        service_fee = round(subtotal * service_fee_rate, 2)
        
        # Calculate total
        total = subtotal + shipping_cost + tax + service_fee
        
        # Create order
        try:
            order = Order.objects.create(
                customer=user,
                payment_method=data.get('payment_method', 'PayPal'),
                payment_status='Processing',
                order_status='Pending',
                sub_total=subtotal,
                shipping=shipping_cost,
                tax=tax,
                service_fee=service_fee,
                total=total
            )
            
            # Create order items
            for item in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    qty=item['quantity'],
                    price=item['price'],
                    sub_total=item['subtotal'],
                    shipping=item['shipping']
                )
            
            # Add vendors to order
            vendors = set(item['product'].vendor for item in validated_items if item['product'].vendor)
            for vendor in vendors:
                order.vendor.add(vendor)
            
            logger.info(f"Created order ID: {order.id} with total: {total}")
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return Response({"detail": "Error creating order"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error processing order data: {str(e)}")
        return Response({"detail": "Error processing order data"}, status=status.HTTP_400_BAD_REQUEST)
    """Create a new order and handle payment processing"""
    data = request.data
    user = request.user

    logger.info(f"Received order data: {data}")

    # Extract order data
    shipping_info = data.get('shipping_info', {})
    payment_method = data.get('payment_method', '').lower()  # Convert to lowercase
    items_data = data.get('items', [])

    # Validate required fields
    errors = {}

    # Define allowed payment methods
    ALLOWED_PAYMENT_METHODS = {'paypal', 'credit_card', 'stripe'}

    # Validate payment method
    if not payment_method:
        errors['payment_method'] = ['Payment method is required']
    elif payment_method not in ALLOWED_PAYMENT_METHODS:
        errors['payment_method'] = [f'Invalid payment method. Allowed values are: {", ".join(ALLOWED_PAYMENT_METHODS)}']
        logger.error(f"Invalid payment method received: {payment_method}")

    if not items_data:
        errors['items'] = ['No items in order']

    # Validate tax, shipping, and total values
    try:
        subtotal = float(data.get('subtotal', 0))
        tax = float(data.get('tax', 0))
        shipping_cost = float(data.get('shipping_cost', 0))
        total_price = float(data.get('total_price', 0))

        # Ensure values are positive
        if subtotal < 0 or tax < 0 or shipping_cost < 0 or total_price < 0:
            errors['tax'] = ['Price values must be positive']

        # Verify total matches sum of components
        calculated_total = subtotal + shipping_cost + tax
        if abs(calculated_total - total_price) > 0.01:
            logger.warning(f"Total price ({total_price}) doesn't match sum of components ({calculated_total})")
            # Update total_price to match calculated total
            total_price = calculated_total
    except (ValueError, TypeError):
        errors['tax'] = ['Invalid numeric values for price fields']

    # Make sure return_url and cancel_url are provided for PayPal
    if payment_method == 'paypal':
        if not data.get('return_url'):
            data['return_url'] = request.build_absolute_uri('/checkout/success')
        if not data.get('cancel_url'):
            data['cancel_url'] = request.build_absolute_uri('/checkout/cancel')

    if errors:
        logger.error(f"Order validation errors: {errors}")
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create order in database
        if user and user.is_authenticated:
            order = Order.objects.create(
                customer=user,  # Explicitly set authenticated user as customer
                sub_total=subtotal,
                shipping=shipping_cost,
                tax=tax,
                total=total_price,
                payment_method=payment_method,
                payment_status="Processing",
                order_status="Pending"
            )
            logger.info(f"Created order with customer: {user.username} (ID: {user.id})")
        else:
            # Create order without customer if user is not authenticated
            order = Order.objects.create(
                sub_total=subtotal,
                shipping=shipping_cost,
                tax=tax,
                total=total_price,
                payment_method=payment_method,
                payment_status="Processing",
                order_status="Pending"
            )
            logger.warning("Created order without customer - user not authenticated")

        # Add vendors to the order
        vendors = set()

        # Create order items
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'])

                # Add vendor to the set
                if product.vendor:
                    vendors.add(product.vendor)

                # Create order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    qty=item_data['quantity'],
                    price=float(item_data['price']),
                    sub_total=float(item_data['price']) * float(item_data['quantity']),
                    vendor=product.vendor
                )
            except Product.DoesNotExist:
                logger.error(f"Product not found: {item_data['product_id']}")
                continue

        # Add vendors to the order
        for vendor in vendors:
            order.vendor.add(vendor)

        # Handle PayPal payment
        if payment_method == 'paypal':
            paypal_client = PayPalClient()

            # Log the data being sent to PayPal
            logger.info(f"Sending data to PayPal: {data}")

            paypal_response = paypal_client.create_order(data)
            logger.info(f"PayPal response received: {paypal_response}")

            if paypal_response.get('status') == 201 and paypal_response.get('approval_url'):
                order.payment_id = paypal_response['order_id']
                order.save()

                return Response({
                    'order_id': order.order_id,
                    'payment_url': paypal_response['approval_url']
                }, status=status.HTTP_201_CREATED)
            else:
                # If PayPal order creation fails, delete our order
                order.delete()
                error_message = paypal_response.get('error', 'Unknown error')
                logger.error(f"PayPal Error: {error_message}")

                return Response({
                    'detail': f'PayPal payment creation failed: {error_message}',
                    'paypal_error': paypal_response.get('response', {})
                }, status=status.HTTP_400_BAD_REQUEST)

        # For other payment methods
        return Response({
            'order_id': order.order_id,
            'status': 'created'
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.exception(f"Error creating order: {str(e)}")
        return Response({
            'detail': f'Error creating order: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def paypal_success(request):
    """Handle PayPal payment success"""
    order_id = request.GET.get('token')

    if not order_id:
        return JsonResponse({'error': 'No order ID provided'}, status=400)

    try:
        # Find the order by PayPal order ID
        order = Order.objects.get(payment_id=order_id)

        # Capture the payment
        paypal_client = PayPalClient()
        capture_response = paypal_client.capture_order(order_id)

        if capture_response.get('status') == 'COMPLETED':
            # Update order status
            order.payment_status = "Paid"
            order.order_status = "Processing"
            order.save()

            # Redirect to frontend success page
            return redirect(f'/checkout/success?order_id={order.order_id}')
        else:
            # Payment capture failed
            return redirect(f'/checkout/cancel?order_id={order.order_id}&error=capture_failed')

    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def paypal_cancel(request):
    """Handle PayPal payment cancellation"""
    return redirect('/checkout/cancel')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capture_payment(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id)
        
        # Проверяем статус оплаты
        if order.payment_status == 'Paid':
            # Для каждого товара в заказе
            for order_item in order.orderitem_set.all():
                # Если ключ еще не назначен
                if not order_item.game_key:
                    # Получаем доступный ключ
                    available_key = GameKey.objects.filter(
                        product=order_item.product,
                        status='available'
                    ).first()
                    
                    if available_key:
                        # Назначаем ключ и меняем его статус
                        available_key.status = 'sold'
                        available_key.save()
                        order_item.game_key = available_key
                        order_item.save()
                        
                        # Отправляем email с ключом
                        send_game_key_email(
                            order.customer.email,
                            order_item.product.name,
                            available_key.key
                        )
            
            # Обновляем статус заказа
            order.order_status = 'Fulfilled'
            order.save()
            
            return Response({
                'status': 'success',
                'message': 'Payment captured and keys assigned'
            })
            
        return Response({
            'status': 'error',
            'message': 'Order not paid'
        }, status=400)
        
    except Order.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order not found'
        }, status=404)


@api_view(['POST'])
def complete_order(request, order_id):
    """
    Complete an order after successful payment
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Update order with payment information
    payment_id = request.data.get('payment_id')
    payment_status = request.data.get('payment_status')
    
    if payment_id and payment_status:
        order.payment_id = payment_id
        order.payment_status = payment_status
        order.status = 'paid'  # Update order status
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    else:
        return Response({"detail": "Payment information missing"}, status=status.HTTP_400_BAD_REQUEST)

def send_game_key_email(email, game_name, key):
    subject = f'Your game key for {game_name}'
    message = f"""
    Thank you for your purchase!
    
    Game: {game_name}
    Key: {key}
    
    Please keep this key safe and do not share it with anyone.
    If you have any issues activating your game, please contact our support.
    
    Enjoy your game!
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

