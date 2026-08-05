"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Eye, ArrowUpDown, Phone } from "lucide-react";
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

export default function OrdersPage() {
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<"createdAt" | "totalAmount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["orders", submittedPhoneNumber, page, debouncedSearch],
    queryFn: () => ordersService.getOrders(submittedPhoneNumber, page, 10, debouncedSearch),
    enabled: !!submittedPhoneNumber,
  });

  const orders = response?.data || [];
  const meta = response?.meta;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumberInput.trim()) {
      setSubmittedPhoneNumber(phoneNumberInput.trim());
      setPage(1);
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track your order history using your phone number</p>
      </div>

      {!submittedPhoneNumber ? (
        <Card className="border-border/50 shadow-sm max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle>Find Your Orders</CardTitle>
            <CardDescription>Enter the phone number used during checkout to view your orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="tel"
                    placeholder="+1234567890" 
                    className="pl-9"
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">View Orders</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Showing orders for {submittedPhoneNumber}</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by ID or Name..." 
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => setSubmittedPhoneNumber("")}>
                  Change Number
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !sortedOrders.length ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No orders found for this phone number.</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                <Table>
                  <TableHeader>
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
                    {sortedOrders.map((order) => (
                      <TableRow key={order.id}>
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
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={meta.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium mx-2">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={meta.page >= meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
