"use client"

import { useState } from "react"
import { Invoice } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ZoomIn, ZoomOut, Download, Mail, Phone, Globe, MapPin, Scissors } from "lucide-react"

interface ProsperInvoiceProps {
  invoice: Invoice
}

function ImagePreviewModal({ file, onClose }: { file: any; onClose: () => void }) {
  const [zoom, setZoom] = useState(1)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-fit h-fit p-0 bg-slate-900 border-slate-800 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-8">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">
              {file.name}
            </DialogTitle>
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1 gap-1">
              <button onClick={() => setZoom(p => Math.max(0.5, p - 0.25))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-black text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(p => Math.min(5, p + 0.25))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={() => setZoom(1)} className="text-[8px] font-black uppercase px-2 py-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">Reset</button>
            </div>
          </div>
          <a href={file.data || file.url} download={file.name} className="bg-[#0091D5] hover:bg-[#0081C0] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all shrink-0 flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Download className="h-3 w-3" /> Download Artifact
          </a>
        </DialogHeader>
        <div className="p-8 bg-slate-800 flex items-center justify-center min-h-[400px] overflow-auto max-h-[85vh]">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}>
            <img src={file.data || file.url} alt={file.name} className="max-w-[85vw] shadow-2xl rounded-xl" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ProsperInvoice({ invoice }: ProsperInvoiceProps) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  const companyInfo = {
    name: "Prosper Manufacturing, LLC",
    address: "600 Cleveland Street",
    suite: "Suite 363",
    city: "Clearwater, Florida 33755",
    phone: "+1 (813) 388-8603",
    web: "prosper-mfg.com",
    email: "billing@prosper-mfg.com"
  }

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
    <div className="bg-white text-[#0F172A] p-12 md:p-16 max-w-[1100px] mx-auto shadow-2xl font-sans relative overflow-hidden" id="prosper-invoice">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-64 h-1 bg-[#0091D5]" />
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-16">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#0F172A] flex items-center justify-center rounded-xl shadow-lg">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-white">
                  <path d="M20 50 Q50 10 80 50 T80 90" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="10" fill="currentColor" />
                </svg>
             </div>
             <div>
               <h1 className="text-4xl font-black tracking-tighter leading-none italic">PROSPER</h1>
               <p className="text-[10px] font-black text-[#0091D5] uppercase tracking-[0.4em]">MANUFACTURING</p>
             </div>
           </div>
           <div className="pt-4 border-l-4 border-[#0091D5] pl-6 space-y-1">
             <h2 className="text-xl font-black uppercase tracking-tight">Invoice #{invoice.invoice_id}</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{invoice.type} &bull; {invoice.status || 'NEW'}</p>
           </div>
        </div>
        
        <div className="text-right space-y-1 text-[11px] font-medium text-slate-500">
          <p className="flex items-center justify-end gap-2"><Phone className="h-3 w-3 text-[#0091D5]" /> {companyInfo.phone}</p>
          <p className="flex items-center justify-end gap-2"><Mail className="h-3 w-3 text-[#0091D5]" /> {companyInfo.email}</p>
          <p className="flex items-center justify-end gap-2"><Globe className="h-3 w-3 text-[#0091D5]" /> {companyInfo.web}</p>
          <p className="flex items-center justify-end gap-2 font-bold text-slate-800"><MapPin className="h-3 w-3 text-[#0091D5]" /> {companyInfo.city}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-12 mb-16">
        <div className="col-span-7 grid grid-cols-2 gap-10">
           <div>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Client Details</h3>
             <div className="space-y-1 text-xs">
                <p className="font-black text-sm uppercase text-[#0F172A]">{invoice.client || 'STRATEGIC PORTFOLIO'}</p>
                <div className="text-slate-500 leading-relaxed">
                  {invoice.billing_address?.street ? (
                    <>
                      <p>{invoice.billing_address.street}</p>
                      <p>{invoice.billing_address.city}, {invoice.billing_address.state} {invoice.billing_address.zip}</p>
                    </>
                  ) : (
                    <p className="italic text-slate-300">Billing address not provided</p>
                  )}
                  {(invoice as any).client_email && <p className="text-[#0091D5] font-bold mt-2">{(invoice as any).client_email}</p>}
                </div>
             </div>
           </div>
           <div>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Shipping Terminal</h3>
             <div className="space-y-1 text-xs">
                <p className="font-black text-sm uppercase text-[#0F172A]">{invoice.client || 'STRATEGIC PORTFOLIO'}</p>
                <div className="text-slate-500 leading-relaxed">
                  {invoice.shipping_address?.street ? (
                    <>
                      <p>{invoice.shipping_address.street}</p>
                      <p>{invoice.shipping_address.city}, {invoice.shipping_address.state} {invoice.shipping_address.zip}</p>
                    </>
                  ) : (
                    <p className="italic text-slate-300">Shipping address not provided</p>
                  )}
                </div>
             </div>
           </div>
        </div>

        <div className="col-span-5 bg-[#F8FAFC] p-8 rounded-3xl border border-slate-100 shadow-sm relative">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#0F172A]">
                <path d="M10 10 H90 V90 H10 Z" fill="currentColor" />
              </svg>
           </div>
           <table className="w-full text-xs font-bold border-separate border-spacing-y-2">
            <tbody>
              <tr>
                <td className="text-slate-400 uppercase tracking-widest text-[9px]">Customer PO</td>
                <td className="text-right font-mono text-[#0F172A]">{invoice.customer_po || 'N/A'}</td>
              </tr>
              <tr>
                <td className="text-slate-400 uppercase tracking-widest text-[9px]">Store ID</td>
                <td className="text-right font-mono text-[#0091D5]">{invoice.store_po || 'N/A'}</td>
              </tr>
              <tr>
                <td className="text-slate-400 uppercase tracking-widest text-[9px]">Doc Date</td>
                <td className="text-right text-[#0F172A]">{formatDate(invoice.dates.created)}</td>
              </tr>
              <tr>
                <td className="text-slate-400 uppercase tracking-widest text-[9px]">Due Date</td>
                <td className="text-right text-[#0F172A] underline decoration-[#0091D5] decoration-2 underline-offset-4">{formatDate(invoice.dates.due)}</td>
              </tr>
              <tr>
                <td className="text-slate-400 uppercase tracking-widest text-[9px]">Fulfillment Terms</td>
                <td className="text-right font-black italic text-[#0F172A]">{invoice.terms || 'Net 7'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Notes / Job Title A */}
      {(invoice.job_title_a?.url || invoice.production_notes) && (
        <div className="mb-12 p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex flex-col md:flex-row gap-8">
           {invoice.job_title_a?.url && (
             <div className="flex-1 space-y-2">
                <p className="text-[9px] font-black text-[#0091D5] uppercase tracking-widest">Digital Asset Access</p>
                <a href={invoice.job_title_a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0F172A] underline break-all hover:text-[#0091D5] transition-colors leading-relaxed block">
                  {invoice.job_title_a.url}
                </a>
             </div>
           )}
           {invoice.production_notes && (
             <div className="flex-1 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Manifest Notes</p>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{invoice.production_notes}"</p>
             </div>
           )}
        </div>
      )}

      {/* Items Table */}
      <div className="mb-12 overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[#0F172A] text-white">
            <tr>
              <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px]">Category / Item #</th>
              <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px]">Description & Visuals</th>
              <th className="py-5 px-4 font-black uppercase tracking-widest text-[10px] text-center w-32">Breakdown</th>
              <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px] text-right">Qty</th>
              <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px] text-right">Price</th>
              <th className="py-5 px-6 font-black uppercase tracking-widest text-[10px] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-6 px-6 align-top">
                  <div className="space-y-1">
                    <p className="font-black text-[#0F172A] uppercase">{(item as any).category}</p>
                    <p className="font-mono text-[10px] text-[#0091D5] font-bold">#{(item as any).item_number || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{(item as any).color || 'N/A'}</p>
                  </div>
                </td>
                <td className="py-6 px-6 align-top">
                  <div className="font-bold text-[#0F172A] uppercase leading-relaxed whitespace-pre-wrap mb-4 text-xs">{item.description}</div>
                  {/* Item images */}
                  {(item as any).attachments && (item as any).attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {(item as any).attachments.map((file: any, i: number) => {
                        const isImage = file?.type === 'image' || file?.mime?.startsWith('image/');
                        if (!isImage) return null;
                        return (
                          <div 
                            key={i} 
                            className="group relative border-2 border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer hover:border-[#0091D5] transition-all transform hover:scale-110 hover:z-10"
                            onClick={() => setSelectedImage(file)}
                          >
                            <img src={file.data || file.url} alt={file.name} className="h-20 w-20 object-cover" />
                            <div className="absolute inset-0 bg-[#0091D5]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <ZoomIn className="text-white h-6 w-6" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="py-6 px-4 align-top">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {Object.entries(item.sizes || {}).map(([sz, qty]) => qty ? (
                      <div key={sz} className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="font-black text-slate-400">{sz}</span>
                        <span className="font-black text-[#0F172A]">{qty}</span>
                      </div>
                    ) : null)}
                  </div>
                </td>
                <td className="py-6 px-6 align-top text-right">
                  <span className="font-black text-[#0F172A] text-lg tracking-tighter">{item.quantity}</span>
                </td>
                <td className="py-6 px-6 align-top text-right">
                  <span className="font-bold text-slate-500">${item.price.toFixed(2)}</span>
                </td>
                <td className="py-6 px-6 align-top text-right">
                  <span className="font-black text-[#0F172A] text-base tracking-tight">${item.amount.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Packing Specifications */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-7">
           <div className="bg-[#0F172A] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#0091D5] opacity-10 blur-3xl rounded-full -mr-16 -mt-16" />
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#0091D5] rounded-lg flex items-center justify-center">
                   <Scissors className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Finishing & Logistics Directives</h3>
             </div>
             <p className="text-sm font-medium leading-relaxed text-slate-300 italic whitespace-pre-wrap">
               {(invoice as any).finishing_notes || "Standard Prosper Manufacturing packing procedures apply for this shipment. Please refer to master terminal guide for default folding/bagging specs."}
             </p>
           </div>
        </div>

        <div className="md:col-span-5 space-y-6">
           <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Subtotal Consolidation</span>
                 <span className="text-[#0F172A] font-black">${invoice.amounts.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Operational Fees</span>
                 <span className="text-[#0F172A] font-black">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">
                 <span>Consolidated Tax</span>
                 <span className="text-[#0F172A] font-black">$0.00</span>
              </div>
              
              <div className="flex justify-between items-end pt-2">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-[#0091D5] uppercase tracking-[0.3em]">Total Outstanding</p>
                   <p className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">${invoice.amounts.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                 </div>
              </div>

              <div className="pt-4 space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black text-emerald-600 uppercase italic">
                    <span>Payments Received</span>
                    <span>-$0.00</span>
                 </div>
                 <div className="bg-[#0F172A] text-white p-4 rounded-2xl flex justify-between items-center shadow-lg transform hover:scale-105 transition-transform cursor-default">
                    <span className="text-[10px] font-black uppercase tracking-widest">Net Final Balance</span>
                    <span className="text-xl font-black tracking-tight">${invoice.amounts.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t-2 border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="space-y-1">
            <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">Prosper Manufacturing &bull; Intelligence in Motion</p>
            <p className="text-[9px] font-bold text-slate-400">Electronic Document #PROS-{invoice.invoice_id}-{new Date().getFullYear()}</p>
         </div>
         <div className="flex gap-4">
            <div className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
               <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </div>
            <div className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
               <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </div>
         </div>
      </div>
      
      {/* Print Terms Footer */}
      <div className="mt-12 text-[8px] text-slate-300 font-bold uppercase tracking-widest text-center italic">
        * This document is a legally binding manifest of manufacturing intent. Prosper Manufacturing LLC 2026.
      </div>

      {/* Render the zoom modal if an image is selected */}
      {selectedImage && (
        <ImagePreviewModal 
          file={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  )
}
