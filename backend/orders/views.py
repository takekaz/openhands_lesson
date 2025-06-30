


from rest_framework import viewsets
from .models import Menu, CustomerCompany, CustomerUser, Order, OrderItem, SystemSetting, Announcement
from .serializers import MenuSerializer, CustomerCompanySerializer, CustomerUserSerializer, OrderSerializer, OrderItemSerializer, SystemSettingSerializer, AnnouncementSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Q
from datetime import date
from django.http import HttpResponse
import csv
from django.shortcuts import get_object_or_404
from django.utils import timezone

@api_view(['GET'])
def daily_summary(request):
    today = date.today()
    
    # 日別注文数の集計
    # 各顧客会社ごとの注文総数
    company_orders = CustomerCompany.objects.annotate(
        total_orders=Sum('employees__orders__items__quantity', 
                         filter=Q(employees__orders__order_date=today))
    ).values('name', 'total_orders')

    # 注文締切時間の表示と色変更のロジック（フロントエンドで実装）
    # ここでは締切時間を取得するAPIを提供
    try:
        cutoff_time_setting = SystemSetting.objects.get(setting_name='order_cutoff_time')
        cutoff_time = cutoff_time_setting.setting_value
    except SystemSetting.DoesNotExist:
        cutoff_time = "未設定" # またはデフォルト値

    # 日別売上集計
    total_sales = Order.objects.filter(order_date=today).aggregate(total=Sum('total_amount'))['total']
    if total_sales is None:
        total_sales = 0.00

    data = {
        'date': today.isoformat(),
        'company_orders': list(company_orders),
        'total_sales': total_sales,
        'order_cutoff_time': cutoff_time,
    }
    return Response(data)

class MenuRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

class CustomerCompanyRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = CustomerCompany.objects.all()
    serializer_class = CustomerCompanySerializer

class CustomerUserRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = CustomerUser.objects.all()
    serializer_class = CustomerUserSerializer

from django.db.models import Prefetch

class OrderRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.select_related(
            'customer_user__user',
            'customer_user__company'
        ).prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.select_related('menu_item'))
        ).all().order_by('-order_date', '-id')

class OrderItemRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

class SystemSettingRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer

class AnnouncementRetrieveUpdateDestroyView(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

@api_view(['GET'])
def export_orders_csv(request):
    selected_date_str = request.query_params.get('date')
    if not selected_date_str:
        return Response({"error": "Date parameter is required."}, status=400)

    try:
        selected_date = date.fromisoformat(selected_date_str)
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="orders_{selected_date_str}.csv"'

    writer = csv.writer(response)
    writer.writerow(['Customer Name', 'Menu', 'Quantity', 'Unit Price', 'Total Amount', 'Order Date', 'Ordered At'])

    orders = Order.objects.filter(order_date=selected_date).select_related(
        'customer_user__company'
    ).prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('menu_item'))
    ).order_by('customer_user__company__name', 'ordered_at')

    for order in orders:
        for item in order.items.all():
            writer.writerow([
                order.customer_user.company.name if order.customer_user and order.customer_user.company else 'N/A',
                item.menu_item.name if item.menu_item else 'N/A',
                item.quantity,
                item.menu_item.price if item.menu_item else 'N/A',
                item.quantity * (item.menu_item.price if item.menu_item else 0),
                order.order_date.isoformat(),
                order.ordered_at.isoformat() if order.ordered_at else ''
            ])
    return response

@api_view(['GET'])
def customer_order_status(request):
    customer_user_id = request.query_params.get('customer_user_id')
    if not customer_user_id:
        return Response({"error": "customer_user_id parameter is required."}, status=400)

    today = date.today()
    
    try:
        customer_user = CustomerUser.objects.get(id=customer_user_id)
    except CustomerUser.DoesNotExist:
        return Response({"error": "CustomerUser not found."}, status=404)

    order = Order.objects.filter(customer_user=customer_user, order_date=today, is_confirmed=True).first()

    if order:
        total_quantity = order.items.aggregate(total=Sum('quantity'))['total']
        return Response({
            'has_ordered': True,
            'total_quantity': total_quantity if total_quantity is not None else 0,
            'order_id': order.id
        })
    else:
        return Response({
            'has_ordered': False,
            'total_quantity': 0
        })

@api_view(['GET'])
def company_order_status(request):
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({"error": "company_id parameter is required."}, status=400)

    today = date.today()
    
    try:
        customer_company = CustomerCompany.objects.get(id=company_id)
    except CustomerCompany.DoesNotExist:
        return Response({"error": "CustomerCompany not found."}, status=404)

    # Aggregate total orders for all users within the company for today
    total_company_orders = Order.objects.filter(
        customer_user__company=customer_company, 
        order_date=today, 
        is_confirmed=True
    ).aggregate(total=Sum('items__quantity'))['total']

    return Response({
        'total_company_orders': total_company_orders if total_company_orders is not None else 0
    })

@api_view(['GET'])
def export_annual_orders_csv(request):
    company_id = request.query_params.get('company_id')
    year = request.query_params.get('year')

    if not company_id or not year:
        return Response({"error": "company_id and year parameters are required."}, status=400)

    try:
        customer_company = CustomerCompany.objects.get(id=company_id)
        year = int(year)
    except (CustomerCompany.DoesNotExist, ValueError):
        return Response({"error": "Invalid company_id or year."}, status=400)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="annual_orders_company_{company_id}_{year}.csv"'

    writer = csv.writer(response)
    writer.writerow(['Employee Name', 'Order Date', 'Menu', 'Quantity', 'Unit Price', 'Total Amount', 'Ordered At'])

    orders = Order.objects.filter(
        customer_user__company=customer_company,
        order_date__year=year,
        is_confirmed=True
    ).select_related(
        'customer_user__user'
    ).prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('menu_item'))
    ).order_by('customer_user__user__username', 'order_date', 'ordered_at')

    for order in orders:
        for item in order.items.all():
            writer.writerow([
                order.customer_user.user.username if order.customer_user and order.customer_user.user else 'N/A',
                order.order_date.isoformat(),
                item.menu_item.name if item.menu_item else 'N/A',
                item.quantity,
                item.menu_item.price if item.menu_item else 'N/A',
                item.quantity * (item.menu_item.price if item.menu_item else 0),
                order.ordered_at.isoformat() if order.ordered_at else ''
            ])
    return response

@api_view(['GET'])
def export_monthly_orders_csv(request):
    company_id = request.query_params.get('company_id')
    year = request.query_params.get('year')
    month = request.query_params.get('month')

    if not company_id or not year or not month:
        return Response({"error": "company_id, year, and month parameters are required."}, status=400)

    try:
        customer_company = CustomerCompany.objects.get(id=company_id)
        year = int(year)
        month = int(month)
    except (CustomerCompany.DoesNotExist, ValueError):
        return Response({"error": "Invalid company_id, year, or month."}, status=400)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="monthly_orders_company_{company_id}_{year}_{month}.csv"'

    writer = csv.writer(response)
    writer.writerow(['Employee Name', 'Order Date', 'Menu', 'Quantity', 'Unit Price', 'Total Amount', 'Ordered At'])

    orders = Order.objects.filter(
        customer_user__company=customer_company,
        order_date__year=year,
        order_date__month=month,
        is_confirmed=True
    ).select_related(
        'customer_user__user'
    ).prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('menu_item'))
    ).order_by('customer_user__user__username', 'order_date', 'ordered_at')

    for order in orders:
        for item in order.items.all():
            writer.writerow([
                order.customer_user.user.username if order.customer_user and order.customer_user.user else 'N/A',
                order.order_date.isoformat(),
                item.menu_item.name if item.menu_item else 'N/A',
                item.quantity,
                item.menu_item.price if item.menu_item else 'N/A',
                item.quantity * (item.menu_item.price if item.menu_item else 0),
                order.ordered_at.isoformat() if order.ordered_at else ''
            ])
    return response



