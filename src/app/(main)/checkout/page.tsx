"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().regex(/^\+[1-9]\d{6,14}$/, "Must be an international format e.g. +1234567890"),
  deliveryAddress: z.string().min(5, "Address is too short").max(500),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const tax = subtotal * 0.05;
  const deliveryCharge = items.length > 0 ? 5.0 : 0;
  const grandTotal = subtotal + tax + deliveryCharge;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const mutation = useMutation({
    mutationFn: ordersService.createOrder,
    onSuccess: (order) => {
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  useEffect(() => {
    if (items.length === 0 && !mutation.isSuccess) {
      toast.info("Your cart is empty");
      router.push("/menu");
    }
  }, [items, router, mutation.isSuccess]);

  const onSubmit = (values: CheckoutFormValues) => {
    if (items.length === 0) return;
    
    mutation.mutate({
      ...values,
      idempotencyKey: crypto.randomUUID(),
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      }))
    });
  };

  if (items.length === 0 && !mutation.isSuccess) {
    return null; // Handle by useEffect redirect
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your order details securely</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-border/40 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-orange-400 w-full" />
            <CardHeader className="px-6 md:px-8 pt-8">
              <CardTitle className="text-2xl">Delivery Information</CardTitle>
              <CardDescription className="text-base">Enter your details where you want the food delivered</CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="customerName" className="font-semibold text-sm text-foreground/80">Full Name</Label>
                  <Input 
                    id="customerName" 
                    placeholder="John Doe" 
                    className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background border-border/50" 
                    {...register("customerName")} 
                  />
                  {errors.customerName && <p className="text-sm text-destructive font-medium">{errors.customerName.message}</p>}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="phoneNumber" className="font-semibold text-sm text-foreground/80">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="+1234567890" 
                    className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background border-border/50" 
                    {...register("phoneNumber")} 
                  />
                  {errors.phoneNumber && <p className="text-sm text-destructive font-medium">{errors.phoneNumber.message}</p>}
                  <p className="text-xs text-muted-foreground/80">International format required (e.g. +1234567890)</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="deliveryAddress" className="font-semibold text-sm text-foreground/80">Delivery Address</Label>
                  <Input 
                    id="deliveryAddress" 
                    placeholder="123 Main St, Apt 4B" 
                    className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background border-border/50" 
                    {...register("deliveryAddress")} 
                  />
                  {errors.deliveryAddress && <p className="text-sm text-destructive font-medium">{errors.deliveryAddress.message}</p>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 rounded-3xl shadow-xl border-border/40 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between items-start gap-4 text-sm bg-muted/30 p-3 rounded-2xl">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 shadow-inner">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold truncate max-w-[120px]">{item.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-foreground mt-1">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Tax (5%)</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Delivery</span>
                <span className="text-foreground">${deliveryCharge.toFixed(2)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-xl font-extrabold">
                <span>Total</span>
                <span className="text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full rounded-full h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
