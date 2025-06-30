
import os
import django
from django.conf import settings
from orders.models import Order, Menu, OrderItem, SystemSetting
from django.utils import timezone
import datetime

# This script is intended to be run via 'python manage.py shell'
# So, Django environment setup is handled by manage.py

print("Starting data addition script...")

# Clear existing OrderItem data to avoid duplicates from previous runs
print("Deleting all existing OrderItem objects...")
OrderItem.objects.all().delete()
print("Existing OrderItem objects deleted.")

# Get existing Order and Menu objects
try:
    order_1 = Order.objects.get(id=1)
    # Filter for distinct menu items to avoid duplicates from previous admin entries
    menu_a_bento = Menu.objects.filter(name='A弁当').first()
    menu_b_bento = Menu.objects.filter(name='B弁当').first()
    menu_c_bento = Menu.objects.filter(name='C弁当').first()

    if menu_a_bento:
        order_item_1 = OrderItem.objects.create(
            order=order_1,
            menu_item=menu_a_bento,
            quantity=2,
            unit_price=500
        )
        print(f"Created OrderItem: {order_item_1}")
    else:
        print("Menu 'A弁当' not found. Please check menu data.")

    # Add more order items for different orders and menus
    order_4 = Order.objects.get(id=4) # Assuming Order 4 exists
    if menu_b_bento:
        order_item_2 = OrderItem.objects.create(
            order=order_4,
            menu_item=menu_b_bento,
            quantity=1,
            unit_price=600
        )
        print(f"Created OrderItem: {order_item_2}")
    else:
        print("Menu 'B弁当' not found. Please check menu data.")

    order_5 = Order.objects.get(id=5) # Assuming Order 5 exists
    if menu_c_bento:
        order_item_3 = OrderItem.objects.create(
            order=order_5,
            menu_item=menu_c_bento,
            quantity=3,
            unit_price=700
        )
        print(f"Created OrderItem: {order_item_3}")
    else:
        print("Menu 'C弁当' not found. Please check menu data.")

except Order.DoesNotExist:
    print("One or more Order objects not found. Please ensure Orders with IDs 1, 4, and 5 exist.")
except Exception as e:
    print(f"An error occurred during OrderItem creation: {e}")


# Create or update SystemSetting for cutoff time
cutoff_time_str = "15:00:00"
system_setting, created = SystemSetting.objects.get_or_create(
    setting_name='order_cutoff_time',
    defaults={'setting_value': cutoff_time_str}
)
if not created:
    system_setting.setting_value = cutoff_time_str
    system_setting.save()
    print(f"Updated SystemSetting: {system_setting.setting_name} = {system_setting.setting_value}")
else:
    print(f"Created SystemSetting: {system_setting.setting_name} = {system_setting.setting_value}")

print("Data addition script finished.")
