from rest_framework import serializers
from .models import Category, Product, Variant, VariantItem, Gallery, Cart, Order, OrderItem, Review

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'image', 'slug']

class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['id', 'product', 'image', 'gallery_id']

class VariantItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariantItem
        fields = ['id', 'variant', 'title', 'content']

class VariantSerializer(serializers.ModelSerializer):
    items = VariantItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Variant
        fields = ['id', 'product', 'name', 'items']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    variants = VariantSerializer(many=True, read_only=True, source='variant_set')
    gallery = GallerySerializer(many=True, read_only=True, source='gallery_set')
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'image', 'description', 'category',
            'price', 'regular_price', 'stock', 'shipping',
            'status', 'featured', 'vendor', 'sku', 'slug',
            'date', 'variants', 'gallery'
        ]

class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'product', 'user', 'qty', 'price',
            'sub_total', 'shipping', 'tax', 'total',
            'size', 'color', 'cart_id', 'date'
        ]

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'product', 'review',
            'reply', 'rating', 'active', 'date'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'order_status', 'shipping_service',
            'tracking_number', 'product', 'qty', 'color', 'size',
            'price', 'sub_total', 'shipping', 'tax', 'total',
            'initial_total', 'saved', 'coupons', 'applied_coupons',
            'item_id', 'vendor', 'date'
        ]

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')
    
    class Meta:
        model = Order
        fields = [
            'id', 'vendor', 'customer', 'sub_total', 'shipping',
            'tax', 'service_fee', 'total', 'payment_status',
            'payment_method', 'order_status', 'initial_total',
            'saved', 'coupons', 'order_id', 'payment_id',
            'date', 'order_items'
        ]