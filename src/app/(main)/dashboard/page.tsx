"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatOrderId } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getOrders(),
  });
  const orders = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  
  const pendingOrders = orders?.filter(o => o.status === "ORDER_RECEIVED" || o.status === "PREPARING").length || 0;
  const outForDelivery = orders?.filter(o => o.status === "OUT_FOR_DELIVERY").length || 0;
  const delivered = orders?.filter(o => o.status === "DELIVERED").length || 0;
  const cancelled = orders?.filter(o => o.status === "CANCELLED").length || 0;
  
  const totalRevenue = orders?.filter(o => o.status === "DELIVERED").reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;

  const recentOrders = orders?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) || [];

  const statCards = [
    { title: "Total Orders", value: totalOrders, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Pending", value: pendingOrders, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "On The Way", value: outForDelivery, icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Delivered", value: delivered, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Cancelled", value: cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/50 shadow-sm col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your 5 most recent orders</p>
          </div>
          <Link href="/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No orders found</div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")} &bull; #{formatOrderId(order.id)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {order.status.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
