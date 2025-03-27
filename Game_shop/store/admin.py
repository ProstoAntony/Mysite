from django.contrib import admin
from store import models as store_models
from .models import GameKey

class GalleryInline(admin.TabularInline):
    model = store_models.Gallery

class VariantInline(admin.TabularInline):
    model = store_models.Variant

class VariantItemInline(admin.TabularInline):
    model = store_models.VariantItem

@admin.register(store_models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'get_products_count']
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ['title']

    def get_products_count(self, obj):
        return obj.product_set.count()
    get_products_count.short_description = 'Games Count'

@admin.register(store_models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'regular_price', 'stock', 'status']
    list_filter = ['category', 'status', 'featured']
    search_fields = ['name', 'description']
    list_editable = ['price', 'regular_price', 'stock', 'status']
    autocomplete_fields = ['category']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description', 'image')
        }),
        ('Pricing', {
            'fields': ('price', 'regular_price', 'stock')
        }),
        ('Status', {
            'fields': ('status', 'featured')
        }),
        ('Additional Info', {
            'fields': ('sku', 'slug', 'vendor'),
            'classes': ('collapse',)
        })
    )

    def save_model(self, request, obj, form, change):
        if not obj.vendor:
            obj.vendor = request.user
        super().save_model(request, obj, form, change)

class VariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'name']
    search_fields = ['product__name', 'name']
    inlines = [VariantItemInline]

class VariantItemAdmin(admin.ModelAdmin):
    list_display = ['variant', 'title', 'content']
    search_fields = ['variant__name', 'title']

class GalleryAdmin(admin.ModelAdmin):
    list_display = ['product', 'gallery_id']
    search_fields = ['product__name', 'gallery_id']

class CartAdmin(admin.ModelAdmin):
    list_display = ['cart_id', 'product', 'user', 'qty', 'price', 'total', 'date']
    search_fields = ['cart_id', 'product__name', 'user__username']
    list_filter = ['date', 'product']

class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'vendor', 'discount']
    search_fields = ['code', 'vendor__username']

class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'total', 'payment_status', 'order_status', 'payment_method', 'date']
    list_editable = ['payment_status', 'order_status', 'payment_method']
    search_fields = ['order_id', 'customer__username']
    list_filter = ['payment_status', 'order_status']


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['item_id','order','product', 'qty', 'price','total']
    search_fields = ['item_id','order__order_id','product__name']
    list_filter = ['order__date']

class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'rating', 'active', 'date']
    search_fields = ['user__username', 'product_name']
    list_filter = ['active', 'rating']

@admin.register(GameKey)
class GameKeyAdmin(admin.ModelAdmin):
    list_display = ['product', 'key', 'status', 'order', 'created_at']
    list_filter = ['status', 'product', 'created_at']
    search_fields = ['key', 'product__name', 'order__order_number']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['product', 'order']
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status == 'sold':
            return self.readonly_fields + ['key', 'status', 'product', 'order']
        return self.readonly_fields

admin.site.register(store_models.Variant, VariantAdmin)
admin.site.register(store_models.VariantItem, VariantItemAdmin)
admin.site.register(store_models.Gallery, GalleryAdmin)
admin.site.register(store_models.Cart, CartAdmin)
admin.site.register(store_models.Order, OrderAdmin)
admin.site.register(store_models.OrderItem, OrderItemAdmin)
admin.site.register(store_models.Review, ReviewAdmin)

