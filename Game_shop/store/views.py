from asyncio import exceptions
from urllib import response

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Variant, VariantItem, Cart, Order, Gallery, Review
from .serializers import (
    CategorySerializer, ProductSerializer, VariantSerializer, 
    VariantItemSerializer, CartSerializer, OrderSerializer,
    GallerySerializer, ReviewSerializer
)
from django.db.models import F
from rest_framework.decorators import api_view
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

# Set up logging
logger = logging.getLogger(__name__)

# ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(status="Published")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured', 'status']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'date', 'name']

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
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer=user)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(active=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'rating']

def clear_cart_items(request):
    try:
        cart_id = request.session.get['card_id']
        store_models = Cart.objects.filter(cart_id=card_id).delete()
    except:
        pass
    return

def get_paypal_accsess_token():
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type', 'client_credentials'}
    auth = {settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET_ID}
    request = requests.post(token_url, data=data, auth = auth)

    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"failed to get access token from PayPal. Status code: {response.status_code}")

def paypal_payment_verify(request, order_id):
    order = store_models.Order.objects.get(order_id=order_id)
    transaction_id = request.Get.get("transaction_id")
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
    order = store_models.Order.objects.get(order_id=order_id)

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
    """
    Create a new order
    """
    data = request.data
    user = request.user if request.user.is_authenticated else None
    
    # Extract shipping address data
    shipping_address_data = data.get('shipping_address', {})
    
    # Extract order items data
    order_items_data = data.get('order_items', [])
    
    if not order_items_data:
        return Response({"detail": "No order items provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create order
    order = Order.objects.create(
        user=user,
        full_name=shipping_address_data.get('full_name', ''),
        email=shipping_address_data.get('email', ''),
        address=shipping_address_data.get('address', ''),
        city=shipping_address_data.get('city', ''),
        postal_code=shipping_address_data.get('postal_code', ''),
        country=shipping_address_data.get('country', ''),
        payment_method=data.get('payment_method', 'PayPal'),
        payment_id=data.get('payment_id', ''),
        payment_status=data.get('payment_status', ''),
        total_price=data.get('total', 0),
        status='pending'
    )
    
    # Create order items
    for item_data in order_items_data:
        product_id = item_data.get('product')
        quantity = item_data.get('quantity', 1)
        price = item_data.get('price', 0)
        
        try:
            product = Product.objects.get(id=product_id)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
        except Product.DoesNotExist:
            order.delete()
            return Response({"detail": f"Product with ID {product_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        order = Order.objects.create(
            customer=user,
            sub_total=subtotal,
            shipping=shipping_cost,
            tax=tax,
            total=total_price,
            payment_method=payment_method,
            payment_status="Processing",
            order_status="Pending"
        )

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
    """Capture a PayPal payment after approval"""
    try:
        # Find the order
        order = Order.objects.get(order_id=order_id, customer=request.user)

        if order.payment_status != "Processing":
            return Response({
                'detail': 'Order is not in processing state'
            }, status=status.HTTP_400_BAD_REQUEST)

        if order.payment_method != 'paypal':
            return Response({
                'detail': 'This endpoint is only for PayPal payments'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Capture the payment
        paypal_client = PayPalClient()
        capture_response = paypal_client.capture_payment(order.payment_id)

        if capture_response.get('status') in [200, 201]:
            # Update order status
            order.payment_status = "Completed"
            order.order_status = "Processing"
            order.save()

            return Response({
                'order_id': order.order_id,
                'status': 'payment_completed'
            }, status=status.HTTP_200_OK)
        else:
            # Payment capture failed
            error_message = capture_response.get('error', 'Unknown error')
            logger.error(f"PayPal payment capture failed: {error_message}")

            return Response({
                'detail': f'Payment capture failed: {error_message}',
                'paypal_error': capture_response.get('response', {})
            }, status=status.HTTP_400_BAD_REQUEST)

    except Order.DoesNotExist:
        return Response({
            'detail': 'Order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception(f"Error capturing payment: {str(e)}")
        return Response({
            'detail': f'Error capturing payment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

