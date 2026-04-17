export interface PrintavoOrder {
  id: number;
  visual_id: number;
  visual_po_number: string;
  order_nickname: string;
  order_total: number;
  amount_outstanding: number;
  public_url?: string;
  due_date: string;
  customer_due_date: string;
  customer: {
    company: string;
    first_name: string;
    last_name: string;
  };
  orderstatus: {
    name: string;
    color: string;
  };
}

export async function fetchPipelineOrders(): Promise<PrintavoOrder[]> {
  const email = (process.env.PRINTAVO_EMAIL || "").toLowerCase();
  const token = process.env.PRINTAVO_API_KEY || "";

  if (!email || !token) {
    console.error("Missing Printavo credentials in ENV.");
    return [];
  }

  try {
    // Fetch up to 200 recent orders to find active ones
    const res = await fetch(`https://www.printavo.com/api/v1/orders?email=${encodeURIComponent(email)}&token=${token}&per_page=200`, {
      next: { revalidate: 300 } // Cache for 5 mins
    });
    
    if (!res.ok) {
      console.error("Printavo API error", res.status);
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch Printavo orders:", error);
    return [];
  }
}
