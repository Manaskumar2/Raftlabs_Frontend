"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Eye, ArrowUpDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatOrderId } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ORDER_RECEIVED: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  PREPARING: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  OUT_FOR_DELIVERY: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  DELIVERED: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<"createdAt" | "totalAmount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);
  const { data: response, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["orders", "admin", debouncedSearch],
    queryFn: ({ pageParam = 1 }) => ordersService.getOrders(undefined, pageParam, 10, debouncedSearch),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      return lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const orders = response?.pages.flatMap((page) => page.data || []) || [];
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const toggleSort = (field: "createdAt" | "totalAmount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === "createdAt") {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const amountA = parseFloat(a.totalAmount);
      const amountB = parseFloat(b.totalAmount);
      return sortOrder === "asc" ? amountA - amountB : amountB - amountA;
    }
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
            <p className="text-muted-foreground mt-1">Manage all customer orders</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or Name..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/50 shadow-sm flex-1 flex flex-col min-h-0">
        <CardContent className="pt-6 flex-1 flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !sortedOrders.length ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border flex-1 overflow-y-auto min-h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("totalAmount")}
                    >
                      <div className="flex items-center gap-1">
                        Total <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order, index) => {
                    const isLast = index === sortedOrders.length - 1;
                    return (
                    <TableRow key={order.id} ref={isLast ? lastOrderElementRef : null}>
                      <TableCell className="font-medium text-xs md:text-sm">
                        #{formatOrderId(order.id)}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")}</TableCell>
                      <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`border-transparent ${statusColors[order.status] || "bg-secondary"}`}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-4 w-4 mr-1" /> View & Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            
            {isFetchingNextPage && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
