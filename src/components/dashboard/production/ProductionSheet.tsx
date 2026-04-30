"use client"

import { Invoice } from "@/lib/api"
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { 
  ImageIcon, 
  FileSpreadsheet, 
  FileText as FilePdf, 
  ClipboardList, 
  MapPin, 
  Calendar,
  Layers,
  Download,
  Eye,
  X,
  Workflow,
  FileText
} from "lucide-react"

interface ProductionSheetProps {
  invoice: Invoice
}

export function ProductionSheet({ invoice }: ProductionSheetProps) {
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

  const renderTextWithLinks = (text: string) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all hover:text-blue-800 transition-colors">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white text-slate-900 p-6 w-full font-sans leading-tight" id="production-sheet">
      {/* Top Meta Info */}
      <div className="flex justify-between items-start mb-3 text-[11px] font-medium text-slate-500">
        <div>Work Order #{invoice.invoice_id} - Prosper Manufacturing, LLC</div>
      </div>

      {/* Production Notes Section */}
      <div className="space-y-2 mb-4">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase">Production Notes</p>
          <p className="text-[11px] font-bold uppercase">{invoice.production_notes || 'ART LINKS ONLY. FOR ART DEPARTAMENT ONLY. NO ADDITIONAL NOTES.'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase">ART LINK:</p>
          {(invoice as any)?.art_links?.map((link: string, i: number) => (
            <a 
              key={i} 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] text-blue-600 underline font-mono break-all block hover:text-blue-800 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase italic tracking-tighter">
            SEPS: <span className="font-bold text-blue-600 underline">
              {renderTextWithLinks((invoice as any).seps || 'N/A')}
            </span>
          </p>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="grid grid-cols-12 gap-8 mb-5 items-center">
        <div className="col-span-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10 text-white">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M30 50 Q50 20 70 50 T70 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter leading-none">PROSPER</h2>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">MANUFACTURING</p>
            </div>
          </div>
        </div>
        
        <div className="col-span-5 text-center space-y-1 text-[11px] text-slate-600 font-medium">
          <p className="font-bold text-slate-900">Prosper Manufacturing, LLC</p>
          <p>600 Cleveland Street, Suite 363</p>
          <p>Clearwater, Florida 33755</p>
          <p>+1 (813) 388-8603 | https://www.prosper-mfg.com/</p>
          <p>viviana.perez@prosper-mfg.com</p>
        </div>

        <div className="col-span-3 flex justify-end">
           <div className="w-24 h-24 border-4 border-slate-900 p-1">
              {/* QR Code Placeholder */}
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                 <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className="w-3 h-3 bg-slate-900" />)}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Invoice Header Title */}
      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
        <div>
          <h3 className="text-2xl font-bold">Invoice #{invoice.invoice_id}</h3>
          <p className="text-sm font-bold text-slate-700">SPENCERS TEST PO# {invoice.customer_po || ''} - {invoice.client} - NEW</p>
        </div>
        <div className="text-[11px] font-bold text-slate-400">Thank you for your business!</div>
      </div>

      {/* Address & Logistics Grid */}
      <div className="grid grid-cols-3 gap-8 mb-5 text-[11px] leading-tight">
        <div>
          <h4 className="font-bold border-b border-slate-200 pb-1 mb-2">Customer Billing</h4>
          <p className="font-bold">{invoice.client}</p>
          <p>Cesar Oliveros</p>
          <p>{invoice.billing_address?.street}</p>
          <p className="text-blue-600">ap@goodietwosleeves.com</p>
        </div>
        <div>
          <h4 className="font-bold border-b border-slate-200 pb-1 mb-2">Customer Shipping</h4>
          <p className="font-bold">{invoice.client}</p>
          <p>Cesar Oliveros</p>
          <p>{invoice.shipping_address?.street}</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 font-bold">
            <span className="text-slate-400">Created</span>
            <span className="text-right text-[10px] uppercase">{formatDate(invoice?.dates?.created || (invoice as any)?.created_at)}</span>
            <span className="text-slate-400">Production Due Date</span>
            <span className="text-right text-[10px] uppercase">{formatDate(invoice?.dates?.due)}</span>
            <span className="text-slate-400">Customer Due Date</span>
            <span className="text-right text-[10px] uppercase">{formatDate(invoice?.dates?.due)}</span>
          </div>
          <div>
            <h4 className="font-bold border-b border-slate-200 pb-1 mb-1">Customer Notes</h4>
            <p className="font-black text-blue-600 italic">DIGITAL PACKING LIST</p>
            {typeof invoice?.job_title_a === 'object' && (invoice?.job_title_a as any)?.url && (
              <a 
                href={(invoice?.job_title_a as any).url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-mono text-[9px] break-all block hover:text-blue-800 transition-colors"
              >
                {(invoice?.job_title_a as any).url}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table - EXACT MATCH TO REFERENCE */}
      <div className="mb-12">
        <table className="w-full border-collapse text-[10px] border border-slate-300">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-2 border border-slate-300 w-24">Category</th>
              <th className="p-2 border border-slate-300 w-16">Item #</th>
              <th className="p-2 border border-slate-300 w-16">Color</th>
              <th className="p-2 border border-slate-300">Description</th>
              {SIZE_HEADERS.map(sz => (
                <th key={sz} className="p-2 border border-slate-300 text-center w-8">{sz}</th>
              ))}
              <th className="p-2 border border-slate-300 text-center w-10">Qty</th>
              <th className="p-2 border border-slate-300 text-center w-12">Items</th>
            </tr>
          </thead>
          <tbody>
            {/* Hardcoded spacing row as seen in ref */}
            <tr className="bg-slate-50">
              <td className="p-2 border border-slate-300 font-bold uppercase italic text-slate-500">Screen Printing</td>
              <td className="p-2 border border-slate-300"></td>
              <td className="p-2 border border-slate-300"></td>
              <td className="p-2 border border-slate-300 text-[10px] leading-relaxed">
                {(invoice as any)?.garment_info && (
                  <p><span className="font-black text-slate-400 uppercase">Estilo: </span><span className="font-bold uppercase">{(invoice as any).garment_info}</span></p>
                )}
                {(invoice as any)?.artwork_status && (
                  <p><span className="font-black text-slate-400 uppercase">Art Status: </span><span className="font-bold uppercase">{(invoice as any).artwork_status}</span></p>
                )}
                {(invoice as any)?.print_location && (
                  <p><span className="font-black text-slate-400 uppercase">Descripción: </span><span className="font-bold uppercase">{(invoice as any).print_location}</span></p>
                )}
                {!(invoice as any)?.garment_info && !(invoice as any)?.artwork_status && !(invoice as any)?.print_location && (
                  <span className="text-slate-300 italic">—</span>
                )}
              </td>
              {SIZE_HEADERS.map(sz => (
                <td key={sz} className="p-2 border border-slate-300"></td>
              ))}
              <td className="p-2 border border-slate-300 text-center font-bold"></td>
              <td className="p-2 border border-slate-300 text-center font-bold">{invoice?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0}</td>
            </tr>
            {invoice?.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2 border border-slate-300"></td>
                <td className="p-2 border border-slate-300">{(item as any).item_number}</td>
                <td className="p-2 border border-slate-300 font-bold">{(item as any).color}</td>
                <td className="p-2 border border-slate-300 font-bold uppercase whitespace-pre-wrap leading-tight">
                  {renderTextWithLinks(item?.description || "")}
                </td>
                {SIZE_HEADERS.map(sz => (
                  <td key={sz} className="p-2 border border-slate-300 text-center font-bold bg-slate-50/50">
                    {item?.sizes?.[sz] || ''}
                  </td>
                ))}
                <td className="p-2 border border-slate-300 text-center font-bold"></td>
                <td className="p-2 border border-slate-300 text-center font-bold">{item?.quantity}</td>
              </tr>
            ))}
            {/* Summary Row */}
            <tr className="bg-slate-50 font-bold">
               <td colSpan={4 + SIZE_HEADERS.length} className="p-2 text-right border border-slate-300 uppercase">Total Quantity</td>
               <td className="p-2 border border-slate-300 text-center bg-white">{invoice?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ATTACHMENTS SECTION - Full-width grid */}
      {(invoice as any)?.attachments?.length > 0 && (
        <section className="mt-5 pt-4 border-t-2 border-slate-200">
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-4">Attachments</h3>

          {/* Images grid — 3 columns, full width */}
          {(invoice as any).attachments.some((f: any) => f?.type?.startsWith('image/')) && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(invoice as any).attachments
                .filter((f: any) => f?.type?.startsWith('image/'))
                .map((file: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-sm overflow-hidden bg-slate-50 shadow-sm">
                    <img src={file.data} alt={file.name} className="w-full h-auto object-contain" />
                    <p className="text-[8px] font-bold text-slate-400 uppercase text-center py-1 bg-slate-100 truncate px-2">{file.name}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Documents row — PDFs and Excel side by side */}
          {(invoice as any).attachments.some((f: any) => !f?.type?.startsWith('image/')) && (
            <div className="grid grid-cols-4 gap-3">
              {(invoice as any).attachments
                .filter((f: any) => !f?.type?.startsWith('image/'))
                .map((file: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-full flex flex-col items-center justify-center h-36 border-2 border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-blue-400 transition-all group shadow-sm relative overflow-hidden">
                          <div className={`w-12 h-12 ${file?.category === 'pdf' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                            {file?.category === 'pdf' ? (
                              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 12h8M8 16h8"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>
                            )}
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Preview</span>
                          <span className="text-[8px] font-bold text-slate-500 truncate max-w-[150px] px-2 text-center">{file.name}</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
                        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0">
                          <DialogTitle className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                            <div className="w-2 h-5 bg-blue-500 rounded-full" />
                            Technical Preview: {file.name}
                          </DialogTitle>
                          <a href={file.data} download={file.name} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all">
                            Download Original
                          </a>
                        </DialogHeader>
                        <div className="flex-1 bg-slate-800">
                          {file?.category === 'pdf' ? (
                            <iframe src={file.data} className="w-full h-full border-none" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                              <div className="w-32 h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                                <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-black text-white uppercase tracking-widest mb-2">Excel Ready for Download</p>
                                <p className="text-sm text-slate-500">Open in Excel for full editing.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <a href={file.data} download={file.name} className="w-full py-1.5 border border-slate-200 rounded-lg text-[8px] font-black uppercase text-slate-400 hover:text-blue-600 transition-all text-center block">
                      Quick Download
                    </a>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* Footer Meta */}
      <div className="mt-20 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-300">
        <div>https://prosper-mfg.printavo.com/work_orders/{invoice?.invoice_id}</div>
        <div>Page 1/3</div>
      </div>
    </div>
  )
}
