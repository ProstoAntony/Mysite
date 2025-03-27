from rest_framework import serializers
from .models import Category, Product, Variant, VariantItem, Gallery, Cart, Order, OrderItem, Review, Wishlist, GameKey

class CategorySerializer(serializers.ModelSerializer):
    games_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'image', 'image_url', 'games_count']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation

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
    category_name = serializers.CharField(source='category.title', read_only=True)
    image_url = serializers.SerializerMethodField()
    variants = VariantSerializer(many=True, read_only=True, source='variant_set')
    gallery = GallerySerializer(many=True, read_only=True, source='gallery_set')
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'image', 'image_url', 'description', 
            'category', 'category_name', 'price', 'regular_price',
            'stock', 'status', 'featured', 'sku', 'slug',
            'date', 'variants', 'gallery'
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

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

class GameKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameKey
        fields = ['key', 'status']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    game_key = GameKeySerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'order_status', 'shipping_service',
            'tracking_number', 'product', 'qty', 'color', 'size',
            'price', 'sub_total', 'shipping', 'tax', 'total',
            'initial_total', 'saved', 'coupons', 'applied_coupons',
            'item_id', 'vendor', 'date', 'game_key'
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
        read_only_fields = ['customer']
    
    def create(self, validated_data):
        # Explicitly set customer from the authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['customer'] = request.user
            
        order = super().create(validated_data)
        
        # Double-check that customer was set
        if not order.customer and request and hasattr(request, 'user') and request.user.is_authenticated:
            order.customer = request.user
            order.save()
            
        return order

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        # Добавим отладочный вывод
        print(f"Serializing wishlist item: {instance.id}")
        data = super().to_representation(instance)
        print(f"Serialized data: {data}")
        return data