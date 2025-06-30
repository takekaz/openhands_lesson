from django.contrib import admin
from .models import Menu, CustomerCompany, CustomerUser, Order, OrderItem, SystemSetting, Announcement

admin.site.register(Menu)
admin.site.register(CustomerCompany)
admin.site.register(CustomerUser)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(SystemSetting)
admin.site.register(Announcement)
