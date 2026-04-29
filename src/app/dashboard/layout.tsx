import { Sidebar } from "@/components/layout/sidebar"
import { FilterProvider } from "@/lib/filter-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <div className="flex min-h-screen bg-background text-slate-300 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <main className="flex-1 p-6 lg:p-10 overflow-auto bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
