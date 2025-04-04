from django.db import models
from store.models import Product
from userauths.models import User

TYPE = (
    ("New Order", "New Order"),
    ("Item Shipped", "Item Shipped"),
    ("Item Delivered", "Item Delivered"),
)

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='customer_wishlists')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s customer wishlist - {self.product.name}"

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    full_name = models.CharField(max_length=200, null=True, blank=True, default=None)
    mobile = models.CharField(max_length=50, null=True, blank=True, default=None)
    email = models.CharField(max_length=100, null=True, blank=True, default=None)
    country = models.CharField(max_length=100, null=True, blank=True, default=None)
    state = models.CharField(max_length=100, null=True, blank=True, default=None)
    city = models.CharField(max_length=100, null=True, blank=True, default=None)
    address = models.CharField(max_length=100, null=True, blank=True, default=None)
    zipcode = models.CharField(max_length=100, null=True, blank=True, default=None)

    class Meta:
        verbose_name_plural = "Custom Address"
    def __str__(self):
        return self.full_name

class Notifications(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Notifications"

    def __str__(self):
        return self.type
