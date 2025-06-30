
from rest_framework import serializers
from .models import Menu, CustomerCompany, CustomerUser, Order, OrderItem, SystemSetting, Announcement

class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = '__all__'

class CustomerCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerCompany
        fields = '__all__'

class CustomerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerUser
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'menu_item', 'menu_item_name', 'menu_item_price', 'quantity', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_company_name = serializers.CharField(source='customer_user.customer_company.name', read_only=True)
    customer_user_username = serializers.CharField(source='customer_user.user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_user', 'customer_user_username', 'customer_company_name', 'order_date', 'total_amount', 'is_confirmed', 'ordered_at', 'items']

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
