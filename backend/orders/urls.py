

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuRetrieveUpdateDestroyView, CustomerCompanyRetrieveUpdateDestroyView, CustomerUserRetrieveUpdateDestroyView, OrderRetrieveUpdateDestroyView, OrderItemRetrieveUpdateDestroyView, SystemSettingRetrieveUpdateDestroyView, AnnouncementRetrieveUpdateDestroyView, daily_summary, export_orders_csv, customer_order_status, company_order_status, export_annual_orders_csv, export_monthly_orders_csv

router = DefaultRouter()
router.register(r'menus', MenuRetrieveUpdateDestroyView)
router.register(r'customer-companies', CustomerCompanyRetrieveUpdateDestroyView)
router.register(r'customer-users', CustomerUserRetrieveUpdateDestroyView)
router.register(r'orders', OrderRetrieveUpdateDestroyView, basename='order')
router.register(r'order-items', OrderItemRetrieveUpdateDestroyView)
router.register(r'system-settings', SystemSettingRetrieveUpdateDestroyView)
router.register(r'announcements', AnnouncementRetrieveUpdateDestroyView)

urlpatterns = [
    path('daily-summary/', daily_summary, name='daily_summary'),
    path('export-csv/', export_orders_csv, name='export_orders_csv'),
    path('customer-order-status/', customer_order_status, name='customer_order_status'),
    path('company-order-status/', company_order_status, name='company_order_status'),
    path('export-annual-orders-csv/', export_annual_orders_csv, name='export_annual_orders_csv'),
    path('export-monthly-orders-csv/', export_monthly_orders_csv, name='export_monthly_orders_csv'),
    path('', include(router.urls)),
]

