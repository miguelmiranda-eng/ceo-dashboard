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
  mos_machine?: string;
  lineitems_attributes?: {
    id: number;
    style_description?: string;
    category?: string;
  }[];
}

export async function fetchPipelineOrders(): Promise<PrintavoOrder[]> {
  const email = (process.env.PRINTAVO_EMAIL || "").toLowerCase();
  const token = process.env.PRINTAVO_API_KEY || "";

  if (!email || !token) {
    console.error("Missing Printavo credentials in ENV.");
    return [];
  }

  try {
    // Fetch two pages of 200 orders each (Printavo per_page max is usually 200)
    const baseUrl = `https://www.printavo.com/api/v1/orders?email=${encodeURIComponent(email)}&token=${token}&per_page=200`;
    
    const [page1, page2] = await Promise.all([
      fetch(`${baseUrl}&page=1`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${baseUrl}&page=2`, { next: { revalidate: 300 } }).then(r => r.json()),
    ]);
    
    const allOrders = [...(page1.data || []), ...(page2.data || [])];
    return allOrders;
  } catch (error) {
    console.error("Failed to fetch Printavo orders:", error);
    return [];
  }
}

export async function fetchManyPages(count: number = 5): Promise<PrintavoOrder[]> {
  const email = (process.env.PRINTAVO_EMAIL || "").toLowerCase();
  const token = (process.env.PRINTAVO_API_KEY || "").trim();

  if (!email || !token) return [];

  try {
    const baseUrl = `https://www.printavo.com/api/v1/orders?email=${encodeURIComponent(email)}&token=${token}&per_page=200`;
    
    // Create an array of fetch promises for each page
    const promises = Array.from({ length: count }, (_, i) => 
      fetch(`${baseUrl}&page=${i + 1}`, { next: { revalidate: 300 } })
        .then(r => r.json())
        .catch(() => ({ data: [] }))
    );
    
    const results = await Promise.all(promises);
    return results.flatMap(p => p.data || []);
  } catch (error) {
    console.error("Failed mass fetch:", error);
    return [];
  }
}
