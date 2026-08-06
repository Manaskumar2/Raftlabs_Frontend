"use client";

import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menu.service";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart.store";
import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const addItem = useCartStore((state) => state.addItem);

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: menuService.getMenu,
  });

  const categories = ["All", "Main Course", "Starters", "Desserts", "Beverages"];

  const filteredItems = menuItems?.filter((item) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || 
                          item.description.toLowerCase().includes(searchLower);
    
    let matchesCategory = false;
    const nameLower = item.name.toLowerCase();
    
    if (category === "All") {
      matchesCategory = true;
    } else if (category === "Desserts") {
      matchesCategory = nameLower.includes("cake") || nameLower.includes("ice cream") || nameLower.includes("brownie");
    } else if (category === "Beverages") {
      matchesCategory = nameLower.includes("drink") || nameLower.includes("coke") || nameLower.includes("tea") || nameLower.includes("coffee");
    } else if (category === "Starters") {
      matchesCategory = nameLower.includes("salad") || nameLower.includes("roll") || nameLower.includes("soup") || nameLower.includes("fries");
    } else if (category === "Main Course") {
      matchesCategory = !["cake", "drink", "soup", "salad", "roll", "cheesecake"].some(w => nameLower.includes(w));
    }
      
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: { id: string, name: string, price: string, imageUrl: string, description: string }) => {
    addItem({
      id: item.id,
      menuItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
      imageUrl: item.imageUrl,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 px-6 py-12 md:py-20 text-center flex flex-col items-center justify-center isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent -z-10 opacity-50" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Craving something <span className="text-primary">delicious?</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Explore our premium selection of handcrafted dishes, delivered fresh and hot directly to your door.
        </p>
        
        <div className="relative w-full max-w-md mx-auto group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input 
            placeholder="Search for burgers, pizza, salads..." 
            className="pl-12 h-14 text-base rounded-full shadow-lg border-border/50 bg-background/95 backdrop-blur focus-visible:ring-primary focus-visible:ring-offset-2 relative z-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x px-2">
        {categories.map((c) => (
          <Button
            key={c}
            variant={category === c ? "default" : "outline"}
            className={`rounded-full px-6 whitespace-nowrap snap-center transition-all ${
              category === c ? "shadow-md scale-105" : "hover:bg-primary/10 hover:border-primary/30"
            }`}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems?.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col group border-border/40 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl bg-card">
            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium">
                  No Image
                </div>
              )}
              
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                  <Badge variant="destructive" className="text-lg px-4 py-1 rounded-full shadow-lg">Sold Out</Badge>
                </div>
              )}

              {/* Quick Add Button Overlay */}
              {item.isAvailable && (
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full shadow-xl shadow-primary/20"
                    onClick={() => handleAddToCart(item)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
            
            <CardHeader className="p-5 pb-2 flex-1">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                <span className="font-bold text-lg text-emerald-600 whitespace-nowrap">${parseFloat(item.price).toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{item.description}</p>
            </CardHeader>
            
            <CardFooter className="p-5 pt-4">
              <Button 
                variant="secondary"
                className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-all group-hover:shadow-md" 
                onClick={() => handleAddToCart(item)}
                disabled={!item.isAvailable}
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredItems?.length === 0 && (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border border-border/50 border-dashed">
          <p className="text-2xl font-semibold text-muted-foreground mb-2">No dishes found</p>
          <p className="text-muted-foreground">Try adjusting your search or selecting a different category.</p>
          <Button 
            variant="outline" 
            className="mt-6 rounded-full"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
