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

  if (!invoice && !error) return <div className="text-white p-8">Loading...</div>
  if (error) return <div className="text-rose-500 p-8">Error loading invoice</div>

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/invoices" className="flex items-center text-slate-400 hover:text-white transition-colors group">
          <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to List</span>
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-black uppercase tracking-widest">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black uppercase tracking-widest text-xs px-6">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Production Header Banner */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Work Order</div>
             <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{invoice.client}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Production Notes</span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed uppercase">
                {invoice.production_notes || "NO ADDITIONAL NOTES. DON'T OVERCROWD WITH INFORMATION."}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Art Intelligence</span>
              {invoice.art_links?.map((link: string, i: number) => (
                <a key={i} href={link} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase transition-colors">
                  <LinkIcon className="h-3 w-3" /> ART LINK {i + 1} <ExternalLink className="h-2 w-2" />
                </a>
              ))}
              {invoice.seps && (
                <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase pt-1">
                   <ClipboardList className="h-3 w-3" /> SEPS: {invoice.seps}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
           <div className="text-xs text-slate-500 font-black uppercase tracking-tighter">Status</div>
           <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase font-black px-4 py-1 text-[10px]">
             {invoice.status}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Master Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-[#0B1120] border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-900/30 border-b border-slate-800/50 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-white tracking-tighter uppercase italic">
                   Invoice #{invoice.invoice_id.split('-').pop()}
                </CardTitle>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">Order Verification System</p>
              </div>
              <div className="text-right">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PO #</div>
                 <div className="text-lg font-black text-white font-mono">{invoice.customer_po || "N/A"}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                       <MapPin className="h-3 w-3" /> Customer Billing
                    </h4>
                    <div className="text-white space-y-1">
                      <p className="font-bold text-base">{invoice.client}</p>
                      <p className="text-slate-400 text-xs leading-relaxed uppercase">{invoice.billing_address?.street || "9400 LURline Avenue\nSuite F\nLos Angeles, California 91311"}</p>
                      <p className="text-blue-400 text-[10px] font-mono mt-2 underline">{invoice.client_email || "ap@goodietwosleeves.com"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                       <MapPin className="h-3 w-3" /> Customer Shipping
                    </h4>
                    <div className="text-white space-y-1">
                      <p className="font-bold text-base">{invoice.client}</p>
                      <p className="text-slate-400 text-xs leading-relaxed uppercase">{invoice.shipping_address?.street || "8140 Saint Andrews Avenue\nTSC Broker, Suite 100\nSan Diego, California 92154"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-[10px] font-black uppercase">Created</span>
                      <span className="text-white text-xs font-mono font-bold">{invoice.dates?.created}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-[10px] font-black uppercase">Production Due</span>
                      <span className="text-amber-500 text-xs font-mono font-bold">{invoice.dates?.due}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-[10px] font-black uppercase">Customer Due</span>
                      <span className="text-white text-xs font-mono font-bold">{invoice.dates?.due}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] font-black uppercase">Terms</span>
                      <span className="text-blue-400 text-[10px] font-black uppercase">{invoice.terms}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Item Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Master Order Breakdown</h4>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantities by Size</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-left">
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
                    <tbody className="divide-y divide-slate-800/30">
                      {invoice.items?.map((item: any, i: number) => (
                        <tr key={i} className="text-xs group hover:bg-white/[0.01]">
                          <td className="py-4 pr-4 text-slate-500 font-bold uppercase truncate max-w-[80px]">{item.category || "N/A"}</td>
                          <td className="py-4 pr-4 text-slate-300 font-bold uppercase">{item.color || "BLACK"}</td>
                          <td className="py-4 pr-4">
                            <p className="text-white font-medium leading-relaxed">{item.description}</p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tight">{item.item_number || "TPA0013M1000"}</p>
                          </td>
                          {SIZE_KEYS.map(size => (
                            <td key={size} className="py-4 text-center px-1 text-slate-400 font-mono font-bold">
                              {item.sizes?.[size] || "-"}
                            </td>
                          ))}
                          <td className="py-4 text-center font-mono font-black text-blue-400">{item.quantity}</td>
                          <td className="py-4 text-right text-white font-bold font-mono">${item.amount?.toLocaleString()}</td>
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
          <Card className="bg-[#0EA5E9]/5 border-[#0EA5E9]/20 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard className="w-24 h-24 text-[#0EA5E9]" />
            </div>
            <CardHeader>
              <CardTitle className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-widest">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white tracking-tighter mb-6 font-mono">
                ${invoice.amounts?.total?.toLocaleString()}
              </div>
              <div className="space-y-3 border-t border-[#0EA5E9]/20 pt-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Subtotal</span>
                  <span className="text-white font-mono font-bold">${invoice.amounts?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Estimated Tax</span>
                  <span className="text-white font-mono font-bold">${invoice.amounts?.tax?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {invoice.approval_status !== 'approved' ? (
              <Button 
                onClick={handleApprove}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs py-7 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
              >
                <FileCheck className="mr-3 h-6 w-6" strokeWidth={3} /> Approve Order Protocol
              </Button>
            ) : (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 text-emerald-500">
                <CheckCircle className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Digital Approval Verified</span>
                  <span className="text-[9px] text-emerald-500/60 font-bold uppercase">{new Date(invoice.updated_at).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <Button variant="outline" className="w-full border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs py-6">
              <Send className="mr-2 h-4 w-4" /> Dispatch to Client
            </Button>
          </div>

          <Card className="bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="h-3 w-3" /> Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-800">
                {invoice.linked_work_orders?.length > 0 ? (
                  invoice.linked_work_orders.map((wo: string) => (
                    <Link key={wo} href={`/dashboard/work-orders?search=${wo}`} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-blue-400">{wo}</span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">Manufacturing Unit</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-[10px] text-slate-600 italic uppercase tracking-widest">Waiting for protocol approval</p>
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
