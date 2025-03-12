from rest_framework import serializers
from .models import Vendor, Payout, BankAccount, Notification
from userauths.models import User
from store.models import OrderItem

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'user', 'image', 'store_name', 'description', 'country', 'vendor_id', 'date', 'slug']

class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = ['id', 'vendor', 'item', 'amount', 'payout_id', 'date']

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'vendor', 'account_type', 'bank_name', 'account_number', 'account_name', 'bank_code', 'stripe_id', 'paypal_address']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'order', 'seen', 'date']
