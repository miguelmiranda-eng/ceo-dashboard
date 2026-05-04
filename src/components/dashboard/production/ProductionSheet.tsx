"use client"

import { useState } from "react"
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
  FileText,
  ZoomIn,
  ZoomOut
} from "lucide-react"

interface ProductionSheetProps {
  invoice: Invoice
}

function AttachmentPreview({ file, isImage }: { file: any, isImage: boolean }) {
  const [zoom, setZoom] = useState(1);

  return (
    <DialogContent className="max-w-[95vw] w-fit h-fit p-0 bg-slate-900 border-slate-800 overflow-hidden">
      <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-8">
        <div className="flex items-center gap-4">
          <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">
            Preview: {file.name}
          </DialogTitle>
          {isImage && (
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1 gap-1">
              <button 
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-black text-slate-500 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(prev => Math.min(5, prev + 0.25))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setZoom(1)}
                className="text-[8px] font-black uppercase px-2 py-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
        <a href={file.data || file.url} download={file.name} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all shrink-0">
          Download
        </a>
      </DialogHeader>
      <div className="p-4 bg-slate-800 flex items-center justify-center min-h-[300px] overflow-auto max-h-[85vh] max-w-[95vw]">
        <div className="flex items-center justify-center min-w-full min-h-full">
          {isImage ? (
            <div 
              className="relative transition-transform duration-200 ease-out flex items-center justify-center" 
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'center center',
              }}
            >
              <img 
                src={file.data || file.url} 
                alt={file.name} 
                className="max-w-[85vw] shadow-2xl" 
              />
            </div>
          ) : file?.type === 'pdf' || file?.category === 'pdf' ? (
            <iframe src={file.data || file.url} className="w-[90vw] h-[80vh] border-none bg-white" />
          ) : (
            <div className="flex flex-col items-center gap-4 p-12 text-white">
              <FileSpreadsheet className="h-16 w-16 text-emerald-500" />
              <p className="font-bold uppercase tracking-widest text-sm">Excel File Ready</p>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export function ProductionSheet({ invoice }: ProductionSheetProps) {
  const SIZE_HEADERS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]

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
          <p className="text-[11px] font-black uppercase italic tracking-tighter">
            SEPS: <span className="font-bold text-blue-600 underline">
              {renderTextWithLinks((invoice as any).seps || 'N/A')}
            </span>
          </p>
        </div>

        {/* Art Links (Dropbox/Google Drive) */}
        {(invoice as any).art_links && (
          <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-black uppercase text-blue-600 flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              Art Links (CAD/High-Res)
            </p>
            <div className="text-[10px] font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
              {renderTextWithLinks(typeof (invoice as any).art_links === 'string' ? (invoice as any).art_links : ((invoice as any).art_links || []).join('\n'))}
            </div>
          </div>
        )}
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
              <th className="p-2 border border-slate-300 min-w-[200px]">Description</th>
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
                  <div className="mb-2">
                    {renderTextWithLinks(item?.description || "")}
                  </div>
                  {/* Item Attachments embed */}
                  {(item as any)?.attachments && (item as any).attachments.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/50">
                      <p className="text-[9px] font-black uppercase text-blue-600 mb-2">Adjuntos del Ítem:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(item as any).attachments.map((file: any, i: number) => {
                          const isImage = file?.type === 'image' || file?.mime?.startsWith('image/');
                          return (
                            <Dialog key={i}>
                              <DialogTrigger asChild>
                                <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm flex flex-col cursor-pointer hover:border-blue-400 transition-all group">
                                  {isImage ? (
                                    <img src={file.data || file.url} alt={file.name} className="w-full h-12 object-cover group-hover:scale-110 transition-transform" />
                                  ) : (
                                    <div className="h-12 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                                      {file?.type === 'pdf' ? <FilePdf className="h-5 w-5 text-rose-500" /> : <FileSpreadsheet className="h-5 w-5 text-emerald-500" />}
                                    </div>
                                  )}
                                  <div className="text-[6px] text-center font-bold text-slate-500 py-0.5 truncate px-1 border-t border-slate-100 bg-slate-50">
                                    {file.name}
                                  </div>
                                </div>
                              </DialogTrigger>
                              <AttachmentPreview file={file} isImage={isImage} />
                            </Dialog>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
      
      {/* Packing Department Section - ALWAYS VISIBLE */}
      <div className="mb-8 border border-slate-300 rounded-sm overflow-hidden">
        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-300 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Packing Department Specifications</h3>
        </div>
        <div className="p-3 min-h-[80px] text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed font-bold bg-white uppercase">
          {(invoice as any).finishing_notes || "NO ADDITIONAL PACKING INSTRUCTIONS."}
        </div>
      </div>

        {/* Production Attachments */}
        {(invoice as any)?.production_attachments && (invoice as any).production_attachments.length > 0 && (
          <div className="border-t border-slate-300 bg-slate-50 p-3">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Adjuntos de Empaque / Terminado</h4>
            <div className="grid grid-cols-4 gap-3">
              {(invoice as any).production_attachments.map((file: any, i: number) => {
                const isImage = file?.type === 'image' || file?.mime?.startsWith('image/');
                return (
                  <Dialog key={i}>
                    <DialogTrigger asChild>
                      <div className="border border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-all group">
                        {isImage ? (
                          <img src={file.data || file.url} alt={file.name} className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="h-20 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-white">
                            {file?.type === 'pdf' || file?.category === 'pdf' ? <FilePdf className="h-8 w-8 text-rose-500" /> : <FileSpreadsheet className="h-8 w-8 text-emerald-500" />}
                          </div>
                        )}
                        <p className="text-[7px] text-center font-bold text-slate-500 py-1 border-t border-slate-100 truncate px-2 bg-slate-50">{file.name}</p>
                      </div>
                    </DialogTrigger>
                    <AttachmentPreview file={file} isImage={isImage} />
                  </Dialog>
                );
              })}
            </div>
          </div>
        )}
      
      {/* Footer Meta */}
      <div className="mt-20 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-300">
        <div>https://prosper-mfg.printavo.com/work_orders/{invoice?.invoice_id}</div>
        <div>Page 1/3</div>
      </div>
    </div>
  )
}
