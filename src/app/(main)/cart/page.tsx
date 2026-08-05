"use client";

import { useCartStore } from "@/store/cart.store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  
  const subtotal = getSubtotal();
  const tax = subtotal * 0.05; // 5% tax
  const deliveryCharge = items.length > 0 ? 5.0 : 0; // Flat $5 delivery
  const grandTotal = subtotal + tax + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-in fade-in duration-500">
        <div className="bg-primary/10 p-8 rounded-full shadow-inner">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Your cart is empty</h2>
        <p className="text-muted-foreground text-lg">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 mt-4">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Cart</h1>
          <p className="text-muted-foreground mt-1">Review your items before checkout</p>
        </div>
        <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.menuItemId} className="overflow-hidden rounded-3xl border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 bg-muted rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  <p className="text-emerald-600 font-bold text-lg mt-1">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl">
                  <div className="flex items-center bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-none hover:bg-muted"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-none hover:bg-muted"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive hover:text-destructive-foreground shadow-sm transition-colors"
                    onClick={() => removeItem(item.menuItemId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24 rounded-3xl shadow-lg border-border/40 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (5%)</span>
                <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span className="font-medium text-foreground">${deliveryCharge.toFixed(2)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-xl font-extrabold">
                <span>Total</span>
                <span className="text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/checkout" className="w-full">
                <Button className="w-full rounded-full h-12 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Checkout Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
