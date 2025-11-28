import React from 'react';
import { Skeleton } from './Skeleton';

export const MetricsCardSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="">
        <Skeleton className="h-7 w-32 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};

export const MetricsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 gap-x-4 gap-y-4">
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
    </div>
  );
};

export const LiveCardSkeleton = () => {
  return (
    <div className="w-full xl:w-[360px] h-[520px] flex-shrink-0 rounded-[1.5rem] border border-slate-100 overflow-hidden bg-white relative">
       <Skeleton className="absolute inset-0 w-full h-full" />
       <div className="absolute top-8 left-5 right-5 flex justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
       </div>
       <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
             <Skeleton className="w-6 h-6 rounded-full" />
             <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-white/50">
             <Skeleton className="w-10 h-10 rounded-lg" />
             <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
             </div>
          </div>
       </div>
    </div>
  );
};

export const RecentOrdersSkeleton = () => {
  return (
    <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
      <div className="flex border-b border-slate-50 p-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-2">
               <Skeleton className="w-6 h-6 rounded-full" />
               <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CampaignItemSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-48" />
            <div className="flex -space-x-2">
              <Skeleton className="w-6 h-6 rounded-full border-2 border-white" />
              <Skeleton className="w-6 h-6 rounded-full border-2 border-white" />
            </div>
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 min-w-[100px]">
            <Skeleton className="w-3.5 h-3.5" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <Skeleton className="w-3.5 h-3.5" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="min-w-[100px]">
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex min-w-[140px] gap-3 items-center">
             <Skeleton className="flex-1 h-1.5 rounded-full" />
             <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const IntegrationCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 h-[200px] flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
             <Skeleton className="h-5 w-32" />
             <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const ContactListSkeleton = () => {
    return (
        <div className="flex flex-col h-full w-80 lg:w-96 border-r border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
             <div className="p-4">
                 <Skeleton className="h-10 w-full rounded-xl" />
             </div>
             <div className="flex-1 overflow-hidden p-4 space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
             </div>
        </div>
    )
}

export const ChatMessagesSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                     <Skeleton className="h-4 w-32 mb-1" />
                     <Skeleton className="h-3 w-16" />
                  </div>
               </div>
               <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
               </div>
            </div>
            <div className="flex-1 p-6 space-y-6">
               <div className="flex justify-start"><Skeleton className="h-10 w-48 rounded-2xl rounded-bl-none" /></div>
               <div className="flex justify-end"><Skeleton className="h-16 w-64 rounded-2xl rounded-br-none" /></div>
               <div className="flex justify-start"><Skeleton className="h-8 w-32 rounded-2xl rounded-bl-none" /></div>
               <div className="flex justify-end"><Skeleton className="h-24 w-72 rounded-2xl rounded-br-none" /></div>
            </div>
            <div className="p-4 border-t border-slate-100">
               <Skeleton className="h-12 w-full rounded-full" />
            </div>
        </div>
    )
}

export const CampaignTableSkeleton = () => {
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
             <tr>
                {[1,2,3,4,5,6].map(i => <th key={i} className="px-6 py-4"><Skeleton className="h-3 w-24" /></th>)}
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2"><Skeleton className="h-3 w-16" /> <Skeleton className="h-3 w-16" /></div>
                  </div>
                </td>
                <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-5">
                   <div className="flex -space-x-2">
                      <Skeleton className="w-8 h-8 rounded-full border-2 border-white" />
                      <Skeleton className="w-8 h-8 rounded-full border-2 border-white" />
                   </div>
                </td>
                <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-5"><Skeleton className="h-4 w-16" /></td>
                <td className="px-6 py-5 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ProductTableSkeleton = () => {
    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-50 p-6 items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="overflow-x-auto">
                <div className="p-4 space-y-4">
                     {[1,2,3,4,5].map(i => (
                         <div key={i} className="flex items-center gap-4">
                             <Skeleton className="h-12 w-12 rounded-lg" />
                             <div className="flex-1">
                                 <Skeleton className="h-4 w-48 mb-2" />
                                 <Skeleton className="h-3 w-24" />
                             </div>
                             <Skeleton className="h-6 w-20 rounded-full" />
                             <Skeleton className="h-4 w-16" />
                         </div>
                     ))}
                </div>
            </div>
        </div>
    )
}

export const StoreDetailsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 text-center">
                     <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                     <Skeleton className="h-6 w-40 mx-auto mb-2" />
                     <Skeleton className="h-4 w-24 mx-auto" />
                 </div>
             </div>
             <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-[1.5rem] border border-slate-100 p-8">
                     <Skeleton className="h-6 w-48 mb-6" />
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-10 w-full rounded-xl" />
                             </div>
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-10 w-full rounded-xl" />
                             </div>
                         </div>
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-32 w-full rounded-xl" />
                         </div>
                         <Skeleton className="h-12 w-full rounded-xl" />
                     </div>
                 </div>
             </div>
        </div>
    )
}
