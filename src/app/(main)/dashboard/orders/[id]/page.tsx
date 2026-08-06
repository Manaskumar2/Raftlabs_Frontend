"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, Clock, Truck, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatOrderId } from "@/lib/utils";

const ORDER_STATUSES = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const statusIcons = {
  ORDER_RECEIVED: <Package className="h-6 w-6" />,
  PREPARING: <Clock className="h-6 w-6" />,
  OUT_FOR_DELIVERY: <Truck className="h-6 w-6" />,
  DELIVERED: <CheckCircle2 className="h-6 w-6" />,
  CANCELLED: <XCircle className="h-6 w-6 text-destructive" />
};

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: !!orderId,
  });

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!order || !confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    try {
      setIsCancelling(true);
      await ordersService.cancelOrder(order.id);
      // Success toast is handled automatically by the WebSocket order.status.updated event
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch {
      toast.error("Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    socket.emit("order.join", { orderId });

    socket.on("order.status.updated", (data: { orderId: string; status: string; updatedAt: string }) => {
      if (data.orderId === orderId) {
        // Optimistic update
        queryClient.setQueryData(["order", orderId], (oldData: unknown) => {
          if (!oldData) return oldData;
          return {
            ...(oldData as object),
            status: data.status,
            updatedAt: data.updatedAt
          };
        });
        
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    });

    return () => {
      socket.emit("order.leave", { orderId });
      socket.off("order.status.updated");
    };
  }, [socket, isConnected, orderId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const canCancel = order.status === "ORDER_RECEIVED" || order.status === "PREPARING";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Order #{formatOrderId(order.id)}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")}
          </p>
        </div>
        {canCancel && (
          <Button 
            variant="destructive" 
            onClick={handleCancelOrder} 
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Cancel Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle>Timeline {isConnected ? <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">Live Sync On</Badge> : null}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isCancelled ? (
                <div className="flex flex-col items-center justify-center py-8 text-destructive space-y-4">
                  {statusIcons.CANCELLED}
                  <h3 className="text-xl font-bold">Order Cancelled</h3>
                </div>
              ) : (
                <div className="relative pt-8 pb-4">
                  <div className="absolute top-12 left-8 right-8 h-1 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ 
                        width: currentStatusIndex >= 0 ? `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%` : "0%" 
                      }} 
                    />
                  </div>

                  <div className="relative flex justify-between">
                    {ORDER_STATUSES.map((status, index) => {
                      const isCompleted = currentStatusIndex >= index;
                      const isCurrent = currentStatusIndex === index;
                      
                      return (
                        <div key={status} className="flex flex-col items-center relative z-10 w-24">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-background transition-colors duration-300 ${
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                            {statusIcons[status as keyof typeof statusIcons]}
                          </div>
                          <span className={`mt-3 text-xs font-medium text-center ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                        {item.menuItem?.imageUrl ? (
                          <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Item</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.menuItem?.name || "Unknown Item"}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-medium">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Contact</p>
                <p className="font-medium">{order.phoneNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Address</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(parseFloat(order.totalAmount) - 5 - (parseFloat(order.totalAmount)/1.05 * 0.05)).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
