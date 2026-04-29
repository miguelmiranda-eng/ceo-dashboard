"use client"

import { Invoice } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProsperInvoiceProps {
  invoice: Invoice
}

export function ProsperInvoice({ invoice }: ProsperInvoiceProps) {
  const companyInfo = {
    name: "Prosper Manufacturing, LLC",
    address: "600 Cleveland Street",
    suite: "Suite 363",
    city: "Clearwater, Florida 33755",
    phone: "+1 (813) 388-8603",
    web: "https://www.prosper-mfg.com/",
    email: "viviana.perez@prosper-mfg.com"
  }

  const SIZE_HEADERS = ["XS", "S", "M", "L", "XL", "2XL"]

  const formatDate = (dateStr: string | any) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white text-slate-900 p-8 md:p-12 max-w-[1000px] mx-auto shadow-sm font-sans border border-slate-200" id="prosper-invoice">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoice #{invoice.invoice_id}</h1>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            {invoice.client} {invoice.customer_po ? `PO# ${invoice.customer_po}` : ''} 
            {invoice.store_po ? ` - ${invoice.store_po}` : ''}
            {invoice.design_num ? ` - ${invoice.design_num}` : ''}
          </p>
          <p className="text-xs font-bold text-slate-500">- NEW</p>
        </div>
        <p className="text-xs text-slate-400 italic">Thank you for your business!</p>
      </div>

      {/* Branding and Info Box */}
      <div className="grid grid-cols-12 gap-8 mb-10">
        <div className="col-span-7 flex gap-6 items-center">
          <div className="relative w-20 h-20 flex-shrink-0">
             <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
             <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-blue-600">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M30 50 Q50 20 70 50 T70 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 50 Q50 35 60 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
             </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none mb-2 tracking-tighter">PROSPER</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">MANUFACTURING</p>
            <div className="text-[11px] text-slate-500 leading-tight space-y-0.5">
              <p className="font-bold text-slate-700">{companyInfo.name}</p>
              <p>{companyInfo.address}</p>
              <p>{companyInfo.suite}</p>
              <p>{companyInfo.city}</p>
              <p>{companyInfo.phone}</p>
              <p className="text-blue-500">{companyInfo.web}</p>
              <p className="text-blue-500">{companyInfo.email}</p>
            </div>
          </div>
        </div>

        <div className="col-span-5 bg-[#F1F5F9] p-5 border border-slate-200">
          <table className="w-full text-[11px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-300/50">
                <td className="py-1.5 font-bold text-slate-600">PO #</td>
                <td className="py-1.5 text-right font-mono font-bold">{invoice.customer_po || '20635'}</td>
              </tr>
              <tr className="border-b border-slate-300/50">
                <td className="py-1.5 font-bold text-slate-600">Created</td>
                <td className="py-1.5 text-right">{formatDate(invoice.dates.created)}</td>
              </tr>
              <tr className="border-b border-slate-300/50">
                <td className="py-1.5 font-bold text-slate-600">Customer Due Date</td>
                <td className="py-1.5 text-right">{formatDate(invoice.dates.due)}</td>
              </tr>
              <tr className="border-b border-slate-300/50">
                <td className="py-1.5 font-bold text-slate-600">Invoice Date</td>
                <td className="py-1.5 text-right">{formatDate(invoice.created_at)}</td>
              </tr>
              <tr className="border-b border-slate-300/50">
                <td className="py-1.5 font-bold text-slate-600">Terms</td>
                <td className="py-1.5 text-right font-black italic">{invoice.terms || 'Net 7'}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-slate-600">Total</td>
                <td className="py-1.5 text-right font-black text-slate-900 underline underline-offset-2">${invoice.amounts.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-3 gap-8 mb-10 text-[11px]">
        <div>
          <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Customer Billing</h3>
          <div className="text-slate-600 space-y-0.5">
            <p className="font-bold uppercase text-slate-900">{invoice.client || 'GOODIE TWO SLEEVES LLC'}</p>
            <p>Cesar Oliveros</p>
            <p>9400 Lurline Avenue</p>
            <p>Suite F</p>
            <p>Los Angeles, California 91311</p>
            <p className="text-blue-500">ap@goodietwosleeves.com</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Customer Shipping</h3>
          <div className="text-slate-600 space-y-0.5">
            <p className="font-bold uppercase text-slate-900">{invoice.client || 'GOODIE TWO SLEEVES LLC'}</p>
            <p>Cesar Oliveros</p>
            <p>8140 Saint Andrews Avenue</p>
            <p>TSC Broker, Suite 100</p>
            <p>San Diego, California 92154</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Customer Notes</h3>
          <div className="text-slate-600">
            <p className="font-black text-blue-600 mb-2 italic">DIGITAL PACKING LIST</p>
            {invoice.job_title_a?.url && (
               <p className="text-blue-500 underline break-all leading-tight">{invoice.job_title_a.url}</p>
            )}
            <p className="mt-2 text-[10px] text-slate-400 italic">Production Link attached in MOS</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-300 rounded-sm mb-10 overflow-hidden">
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-[#F8FAFC] border-b border-slate-300">
            <tr>
              <th className="py-2 px-2 text-left border-r border-slate-300 font-bold">Category</th>
              <th className="py-2 px-2 text-left border-r border-slate-300 font-bold">Item #</th>
              <th className="py-2 px-2 text-left border-r border-slate-300 font-bold">Color</th>
              <th className="py-2 px-2 text-left border-r border-slate-300 font-bold min-w-[150px]">Description</th>
              {SIZE_HEADERS.map(sz => (
                <th key={sz} className="py-2 px-1 text-center border-r border-slate-300 w-8">{sz}</th>
              ))}
              <th className="py-2 px-2 text-center border-r border-slate-300">Qty</th>
              <th className="py-2 px-2 text-right border-r border-slate-300">Price</th>
              <th className="py-2 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2 px-2 border-r border-slate-200 font-medium">{item.category}</td>
                <td className="py-2 px-2 border-r border-slate-200 font-mono">{(item as any).item_number || ''}</td>
                <td className="py-2 px-2 border-r border-slate-200 uppercase">{(item as any).color || ''}</td>
                <td className="py-2 px-2 border-r border-slate-200">
                  <div className="font-bold text-slate-900 uppercase leading-tight whitespace-pre-wrap">{item.description}</div>
                </td>
                {SIZE_HEADERS.map(sz => (
                  <td key={sz} className="py-2 px-1 text-center border-r border-slate-200 text-slate-500 font-medium">
                    {item.sizes?.[sz] || ''}
                  </td>
                ))}
                <td className="py-2 px-2 border-r border-slate-200 text-center font-bold">{item.quantity}</td>
                <td className="py-2 px-2 border-r border-slate-200 text-right">${item.price.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-black">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-[280px] bg-[#F1F5F9] p-5 border border-slate-200 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-slate-600 text-xs">Total Quantity</span>
            <span className="font-bold text-slate-900">{invoice.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-slate-600">Item Total</span>
            <span className="font-bold text-slate-900">${invoice.amounts.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-slate-600">Fees Total</span>
            <span className="font-bold text-slate-900">$0.00</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-slate-600">Sub Total</span>
            <span className="font-bold text-slate-900">${invoice.amounts.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-slate-600">Tax</span>
            <span className="font-bold text-slate-900">$0.00</span>
          </div>
          <div className="flex justify-between text-[12px] pt-1 border-t border-slate-300">
            <span className="font-black text-slate-900 uppercase">Total Due</span>
            <span className="font-black text-slate-900 underline decoration-2 decoration-blue-500 underline-offset-4">${invoice.amounts.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-emerald-600">
            <span className="font-bold uppercase">Paid</span>
            <span className="font-bold">-$0.00</span>
          </div>
          <div className="flex justify-between text-[12px] font-black text-rose-600">
            <span className="uppercase">Outstanding</span>
            <span className="underline underline-offset-2 decoration-rose-400">${invoice.amounts.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-4">
        Fill out your terms & conditions here: https://www.printavo.com/accounts/invoice_information
      </div>
    </div>
  )
}
