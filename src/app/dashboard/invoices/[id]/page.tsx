"use client"

import { use } from "react"
import useSWR from "swr"
import { 
  fetchInvoice, 
  approveInvoice, 
  Invoice 
} from "@/lib/api"
import { 
  ChevronLeft, 
  Download, 
  Send, 
  CheckCircle, 
  Printer,
  CreditCard,
  FileCheck,
  ExternalLink,
  ClipboardList,
  MapPin,
  Link as LinkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "2XL"]

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useI18n()
  const { data: invoice, error, mutate } = useSWR(`invoice-${id}`, () => fetchInvoice(id))

  const handleApprove = async () => {
    try {
      await approveInvoice(id)
      mutate()
    } catch (err) {
      console.error(err)
      alert("Error approving invoice")
    }
  }

  if (error) return <div className="text-rose-500 p-8 font-black uppercase text-center text-xs tracking-widest">Error loading invoice</div>
  if (!invoice) return <div className="text-[#0091D5] p-20 font-black uppercase text-center text-xs tracking-widest animate-pulse">Loading Invoice...</div>

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 p-2">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/invoices" className="flex items-center text-slate-500 hover:text-[#0091D5] transition-colors group">
          <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 bg-white text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Production Header Banner */}
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Work Order</div>
             <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">{invoice.client}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Production Notes</span>
              <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase bg-slate-50 p-4 rounded-xl border border-slate-100">
                {invoice.production_notes || "NO ADDITIONAL NOTES. DON'T OVERCROWD WITH INFORMATION."}
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Art Intelligence</span>
              {invoice.art_links?.map((link: string, i: number) => (
                <a key={i} href={link} target="_blank" className="flex items-center gap-2 text-[#0091D5] hover:text-[#0081C0] text-[10px] font-black uppercase transition-colors bg-blue-50/50 p-2 rounded-lg border border-blue-100 w-max">
                  <LinkIcon className="h-3 w-3" /> ART LINK {i + 1} <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              ))}
              {invoice.seps && (
                <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-2 rounded-lg border border-purple-100 text-[10px] font-black uppercase w-max">
                   <ClipboardList className="h-3 w-3" /> SEPS: {invoice.seps}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right space-y-2 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</div>
           <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 uppercase font-black px-4 py-1.5 text-[10px] rounded-lg shadow-sm">
             {invoice.status}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Master Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase italic flex items-center gap-3">
                   <div className="w-1.5 h-8 bg-[#0091D5] rounded-full" />
                   Invoice #{invoice.invoice_id?.split('-').pop() || invoice.invoice_id}
                </CardTitle>
                <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em] ml-5">Order Verification System</p>
              </div>
              <div className="text-right bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO #</div>
                 <div className="text-xl font-black text-[#0091D5] font-mono tracking-tighter">{invoice.customer_po || "N/A"}</div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                       <MapPin className="h-4 w-4 text-[#0091D5]" /> Customer Billing
                    </h4>
                    <div className="text-slate-800 space-y-1">
                      <p className="font-black text-sm uppercase">{invoice.client}</p>
                      <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase">{invoice.billing_address?.street || "9400 LURline Avenue\nSuite F\nLos Angeles, California 91311"}</p>
                      <p className="text-[#0091D5] text-[10px] font-black mt-3 underline uppercase">{(invoice as any).client_email || "ap@goodietwosleeves.com"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                       <MapPin className="h-4 w-4 text-[#0091D5]" /> Customer Shipping
                    </h4>
                    <div className="text-slate-800 space-y-1">
                      <p className="font-black text-sm uppercase">{invoice.client}</p>
                      <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase">{invoice.shipping_address?.street || "8140 Saint Andrews Avenue\nTSC Broker, Suite 100\nSan Diego, California 92154"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Created</span>
                      <span className="text-[#0F172A] text-xs font-mono font-black">{invoice.dates?.created}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Production Due</span>
                      <span className="text-amber-600 text-xs font-mono font-black">{invoice.dates?.due}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Customer Due</span>
                      <span className="text-[#0F172A] text-xs font-mono font-black">{invoice.dates?.due}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Terms</span>
                      <span className="text-[#0091D5] text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">{invoice.terms}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Item Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h4 className="text-[10px] font-black text-[#0091D5] uppercase tracking-widest">Master Order Breakdown</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantities by Size</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                        <th className="pb-4 pr-4">Category</th>
                        <th className="pb-4 pr-4">Color</th>
                        <th className="pb-4 pr-4 w-[250px]">Description</th>
                        {SIZE_KEYS.map(size => (
                          <th key={size} className="pb-4 text-center px-1">{size}</th>
                        ))}
                        <th className="pb-4 text-center">Total</th>
                        <th className="pb-4 text-right">Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items?.map((item: any, i: number) => (
                        <tr key={i} className="text-xs group hover:bg-slate-50 transition-colors">
                          <td className="py-5 pr-4 text-slate-500 font-bold uppercase truncate max-w-[80px]">{item.category || "N/A"}</td>
                          <td className="py-5 pr-4 text-slate-800 font-black uppercase">{item.color || "BLACK"}</td>
                          <td className="py-5 pr-4">
                            <p className="text-[#0F172A] font-bold leading-relaxed">{item.description}</p>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest">{item.item_number || "TPA0013M1000"}</p>
                          </td>
                          {SIZE_KEYS.map(size => (
                            <td key={size} className="py-5 text-center px-1 text-slate-500 font-mono font-bold">
                              {item.sizes?.[size] || "-"}
                            </td>
                          ))}
                          <td className="py-5 text-center font-mono font-black text-[#0091D5]">{item.quantity}</td>
                          <td className="py-5 text-right text-[#0F172A] font-black font-mono">${item.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ledger & Actions */}
        <div className="space-y-6">
          <Card className="bg-blue-50/50 border-[#0091D5]/20 shadow-xl overflow-hidden relative group rounded-[2rem]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard className="w-24 h-24 text-[#0091D5]" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black text-[#0091D5] uppercase tracking-widest">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-5xl font-black text-[#0F172A] tracking-tighter mb-8 font-mono">
                ${invoice.amounts?.total?.toLocaleString() || "0"}
              </div>
              <div className="space-y-4 border-t border-blue-100 pt-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-[#0F172A] font-mono font-black">${invoice.amounts?.subtotal?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Estimated Tax</span>
                  <span className="text-[#0F172A] font-mono font-black">${invoice.amounts?.tax?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {invoice.approval_status !== 'approved' ? (
              <Button 
                onClick={handleApprove}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-[10px] h-16 rounded-[1.25rem] shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <FileCheck className="mr-3 h-6 w-6" strokeWidth={3} /> Approve Order Protocol
              </Button>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-[1.25rem] p-5 flex items-center gap-4 text-emerald-600 shadow-sm">
                <CheckCircle className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Digital Approval Verified</span>
                  <span className="text-[9px] text-emerald-500 font-black uppercase">{new Date(invoice.updated_at).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-500 hover:text-[#0091D5] hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] h-14 rounded-[1.25rem] shadow-sm">
              <Send className="mr-2 h-5 w-5" /> Dispatch to Client
            </Button>
          </div>

          <Card className="bg-white border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-5 p-8 bg-slate-50/50">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#0091D5]" /> Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {invoice.linked_work_orders?.length > 0 ? (
                  invoice.linked_work_orders.map((wo: string) => (
                    <Link key={wo} href={`/dashboard/work-orders?search=${wo}`} className="flex items-center justify-between p-6 hover:bg-blue-50/30 transition-colors group">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-black text-[#0091D5]">{wo}</span>
                        <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">Manufacturing Unit</span>
                      </div>
                      <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-[#0091D5] transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Waiting for protocol approval</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
