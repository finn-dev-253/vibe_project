import React from 'react';
import { DataTable } from '@/components/ui/data-table';

// Would be fetched from Next.js server components via the NestJS endpoint
const getMockUsers = async () => {
    // Simulating delay for aesthetic
    await new Promise((res) => setTimeout(res, 500));
    return [
        { id: '1', email: 'admin@vibe.com', permissions: ['admin:roles:view', 'admin:dashboard'] },
        { id: '2', email: 'user@vibe.com', permissions: ['readonly'] },
        { id: '3', email: 'editor@vibe.com', permissions: ['content:edit', 'content:publish', 'readonly'] }
    ];
}

export default async function AdminRolesPage() {
    const users = await getMockUsers();

    const columns = [
        { header: 'ID', accessorKey: 'id' as const },
        { header: 'Email', accessorKey: 'email' as const },
        { 
            header: 'Permissions', 
            accessorKey: 'permissions' as const,
            cell: (u: any) => (
                <div className="flex gap-2 flex-wrap">
                    {u.permissions.map((p: string) => (
                        <span key={p} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 font-medium text-xs rounded border border-emerald-500/20 shadow-sm">
                            {p}
                        </span>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white font-sans selection:bg-emerald-500/30">
            <div className="max-w-6xl mx-auto space-y-8 mt-12 mb-24 relative">
                
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="flex flex-col gap-2">
                   <h1 className="text-4xl font-extrabold tracking-tight text-white/95">Access Control</h1>
                   <p className="text-slate-400 mt-2 text-base max-w-xl leading-relaxed">
                     Manage internal users and their associated roles across the logistics systems. This dashboard directly consumes a 
                     Materialized View from PostgreSQL for highly optimal O(1) reads.
                   </p>
                </div>
                
                <DataTable data={users} columns={columns} />
            </div>
        </div>
    );
}
