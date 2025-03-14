import requests
import logging
import base64
from django.conf import settings
import json
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


def clear_cart_items(request):
    try:
        cart_id = request.session.get['card_id']
        store_models = Cart.objects.filter(cart_id=card_id).delete()
    except:
        pass
    return

def get_paypal_accsess_token():
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    auth = {settings.REACT_APP_PAYPAL_CLIENT_ID, settings.REACT_APP_PAYPAL_SECRET_ID}
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
    print (get_paypal_accsess_token())

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

# logger = logging.getLogger(__name__)

# class PayPalClient:
#     """PayPal API Client for handling payment operations"""
#
#     def __init__(self):
#         self.client_id = settings.PAYPAL_CONFIG['client_id']
#         self.client_secret = settings.PAYPAL_CONFIG['client_secret']
#         self.api_url = settings.PAYPAL_CONFIG['api_url']
#         self.mode = settings.PAYPAL_CONFIG['mode']
#         self.access_token = None
#
#         # Log initialization
#         logger.info(f"PayPal client initialized with mode: {self.mode}, API URL: {self.api_url}")
#         # Don't log credentials, but log a masked version to verify they exist
#         logger.info(f"Client ID exists: {bool(self.client_id)}, Client Secret exists: {bool(self.client_secret)}")
#
#     def get_access_token(self):
#         """Get OAuth access token from PayPal"""
#         if self.access_token:
#             return self.access_token
#
#         auth = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
#         headers = {
#             "Authorization": f"Basic {auth}",
#             "Content-Type": "application/x-www-form-urlencoded"
#         }
#         data = "grant_type=client_credentials"
#
#         logger.info("Requesting PayPal access token...")
#
#         try:
#             response = requests.post(
#                 f"{self.api_url}/v1/oauth2/token",
#                 headers=headers,
#                 data=data,
#                 timeout=30  # Add timeout
#             )
#
#             logger.info(f"PayPal token response status: {response.status_code}")
#
#             if response.status_code != 200:
#                 logger.error(f"PayPal token error: {response.text}")
#
#             response.raise_for_status()
#             result = response.json()
#             self.access_token = result["access_token"]
#             logger.info("Successfully obtained PayPal access token")
#             return self.access_token
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Network error getting PayPal access token: {str(e)}")
#             raise
#         except Exception as e:
#             logger.error(f"Error getting PayPal access token: {str(e)}")
#             raise
#
#     def create_order(self, order_data):
#         """Create a PayPal order"""
#         logger.info(f"Creating PayPal order with data: {json.dumps(order_data, default=str)}")
#
#         try:
#             access_token = self.get_access_token()
#
#             headers = {
#                 "Authorization": f"Bearer {access_token}",
#                 "Content-Type": "application/json"
#             }
#
#             # Calculate order amount and ensure it's properly formatted
#             total_amount = "{:.2f}".format(float(order_data.get('total_price', '0')))
#
#             # Enhanced PayPal order data with more details
#             paypal_order_data = {
#                 "intent": "CAPTURE",
#                 "purchase_units": [
#                     {
#                         "amount": {
#                             "currency_code": "USD",
#                             "value": total_amount,
#                             "breakdown": {
#                                 "item_total": {
#                                     "currency_code": "USD",
#                                     "value": str(order_data.get('subtotal', '0'))
#                                 },
#                                 "tax_total": {
#                                     "currency_code": "USD",
#                                     "value": str(order_data.get('tax', '0'))
#                                 },
#                                 "shipping": {
#                                     "currency_code": "USD",
#                                     "value": str(order_data.get('shipping_cost', '0'))
#                                 }
#                             }
#                         },
#                         "description": f"Order #{order_data.get('id', 'Unknown')} from Game Shop",
#                         "items": [
#                             {
#                                 "name": item.get('name', 'Game Product'),
#                                 "quantity": str(item.get('quantity', '1')),
#                                 "unit_amount": {
#                                     "currency_code": "USD",
#                                     "value": "{:.2f}".format(float(item.get('price', '0')))
#                                 }
#                             } for item in order_data.get('items', [])
#                         ]
#                     }
#                 ],
#                 "application_context": {
#                     "return_url": order_data.get('return_url', 'http://localhost:3000/checkout/success'),
#                     "cancel_url": order_data.get('cancel_url', 'http://localhost:3000/checkout/cancel'),
#                     "brand_name": "Game Shop",
#                     "user_action": "PAY_NOW",
#                     "shipping_preference": "NO_SHIPPING",
#                     "landing_page": "LOGIN"
#                 }
#             }
#
#             logger.info(f"Sending PayPal order request: {json.dumps(paypal_order_data)}")
#
#             response = requests.post(
#                 f"{self.api_url}/v2/checkout/orders",
#                 headers=headers,
#                 json=paypal_order_data,
#                 timeout=30  # Add timeout
#             )
#
#             logger.info(f"PayPal order creation response status: {response.status_code}")
#
#             if response.status_code != 201:
#                 logger.error(f"PayPal order creation error: {response.text}")
#
#             result = response.json()
#
#             if response.status_code == 201:
#                 # Extract approval URL and order ID
#                 approval_url = None
#                 for link in result.get('links', []):
#                     if link['rel'] == 'approve':
#                         approval_url = link['href']
#                         break
#
#                 logger.info(f"PayPal order created successfully. Order ID: {result['id']}")
#
#                 return {
#                     'status': response.status_code,
#                     'order_id': result['id'],
#                     'approval_url': approval_url
#                 }
#             else:
#                 logger.error(f"PayPal order creation failed: {result}")
#                 return {
#                     'status': response.status_code,
#                     'error': result.get('message', 'Unknown error'),
#                     'response': result
#                 }
#
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Network error creating PayPal order: {str(e)}")
#             return {
#                 'status': 500,
#                 'error': f"Network error: {str(e)}"
#             }
#         except Exception as e:
#             logger.error(f"Error creating PayPal order: {str(e)}")
#             return {
#                 'status': 500,
#                 'error': str(e)
#             }
#
#     def capture_payment(self, order_id):
#         """Capture an approved PayPal payment"""
#         logger.info(f"Capturing PayPal payment for order: {order_id}")
#
#         try:
#             access_token = self.get_access_token()
#
#             headers = {
#                 "Authorization": f"Bearer {access_token}",
#                 "Content-Type": "application/json"
#             }
#
#             response = requests.post(
#                 f"{self.api_url}/v2/checkout/orders/{order_id}/capture",
#                 headers=headers,
#                 timeout=30  # Add timeout
#             )
#
#             logger.info(f"PayPal payment capture response status: {response.status_code}")
#
#             if response.status_code not in [200, 201]:
#                 logger.error(f"PayPal payment capture error: {response.text}")
#
#             result = response.json()
#
#             if response.status_code in [200, 201]:
#                 logger.info(f"PayPal payment captured successfully for order: {order_id}")
#                 return {
#                     'status': response.status_code,
#                     'capture_id': result.get('purchase_units', [{}])[0].get('payments', {}).get('captures', [{}])[0].get('id'),
#                     'order_id': result.get('id')
#                 }
#             else:
#                 logger.error(f"PayPal payment capture failed: {result}")
#                 return {
#                     'status': response.status_code,
#                     'error': result.get('message', 'Unknown error'),
#                     'response': result
#                 }
#
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Network error capturing PayPal payment: {str(e)}")
#             return {
#                 'status': 500,
#                 'error': f"Network error: {str(e)}"
#             }
#         except Exception as e:
#             logger.error(f"Error capturing PayPal payment: {str(e)}")
#             return {
#                 'status': 500,
#                 'error': str(e)
#             }