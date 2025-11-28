import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Minus,
  Eye,
  Percent,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Search,
  PackagePlus,
  BarChart2,
  Filter,
  ArrowUpDown,
  Plus,
  Package,
  Clock,
  MoreHorizontal,
  Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricsGridSkeleton, LiveCardSkeleton, RecentOrdersSkeleton, CampaignItemSkeleton } from '../ui/PageSkeletons';

interface DashboardContentProps {
  isLoading?: boolean;
}

/**
 * DashboardContent
 * 
 * The main dashboard content without header.
 * Used inside DashboardLayout with sliding tab animation.
 */
export const DashboardContent: React.FC<DashboardContentProps> = ({ isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex-1 pt-6 pr-8 pb-8 pl-8">
        <MetricsGridSkeleton />
        <div className="flex flex-col xl:flex-row gap-6 mb-8">
          <LiveCardSkeleton />
          <RecentOrdersSkeleton />
        </div>
        <div className="">
          <div className="flex items-center justify-between mb-6">
             <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-3">
             <CampaignItemSkeleton />
             <CampaignItemSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-6 pr-8 pb-8 pl-8">
      {/* SECTION 1: Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 gap-x-4 gap-y-4">
        {/* Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Sales
            </p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              $124,500
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-500">+12.5%</span>
              <span className="text-xs text-slate-400 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* AOV */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Avg. Order
            </p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              $85.40
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Minus className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">0.8%</span>
              <span className="text-xs text-slate-400 ml-1">stable</span>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Views
            </p>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Eye className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              1.2M
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-500">+24%</span>
              <span className="text-xs text-slate-400 ml-1">new audiences</span>
            </div>
          </div>
        </div>

        {/* Conversion */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Conversion
            </p>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              3.2%
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-400">Clicks to Order</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
              <span className="text-xs text-purple-600 font-medium">
                Top 5%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Live & Recent Orders */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        {/* LIVE NOW CARD */}
        <div className="w-full xl:w-[360px] h-[520px] flex-shrink-0 relative group rounded-[1.5rem] overflow-hidden shadow-2xl shadow-purple-900/10 ring-4 ring-white border border-slate-100">
          {/* Navigation Indicators */}
          <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
            <div className="h-1 flex-1 bg-white/90 rounded-full shadow-sm"></div>
            <div className="h-1 flex-1 bg-white/30 rounded-full backdrop-blur-sm"></div>
            <div className="h-1 flex-1 bg-white/30 rounded-full backdrop-blur-sm"></div>
            <div className="h-1 flex-1 bg-white/30 rounded-full backdrop-blur-sm"></div>
          </div>

          {/* Hover Navigation Arrows */}
          <button className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 border border-white/10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 border border-white/10">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Background Image */}
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Live Shopping" />

          {/* Overlay Gradient */}
          <div className="bg-gradient-to-b from-black/40 via-transparent to-black/80 absolute top-0 right-0 bottom-0 left-0"></div>

          {/* Top Controls */}
          <div className="absolute top-8 left-5 right-5 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse border border-red-500/50">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                LIVE
              </span>
              <div className="bg-black/40 backdrop-blur-xl text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
                <Users className="w-3 h-3" />
                12.4k
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-6 h-6 rounded-full border border-white/50" alt="Host" />
              <span className="text-white/80 text-xs font-medium">
                with Sarah J.
              </span>
            </div>
            <h3 className="text-white font-semibold text-lg leading-snug mb-4">
              Summer Collection Launch Event
            </h3>

            {/* Featured Product Mini Card */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2.5 rounded-xl border border-white/20 shadow-lg">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" className="w-10 h-10 rounded-lg bg-white object-cover" alt="Product" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-white">
                  Floral Silk Dress
                </p>
                <p className="text-[11px] text-white/70 font-medium">$129.00</p>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 rounded-lg hover:bg-slate-200 transition-colors shadow-md">
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS LIST */}
        <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="flex border-slate-50 border-b pt-6 pr-6 pb-6 pl-6 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900">Recent Orders</h3>
            </div>
            <button className="text-xs font-medium text-slate-500 hover:text-slate-900">
              Real-time update
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="">
                  <th className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider pt-3 pr-6 pb-3 pl-6">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {/* Order 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="pt-4 pr-6 pb-4 pl-6">
                      <span className="font-mono text-xs font-normal text-slate-600 whitespace-nowrap">
                        #ORD-9281
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs text-slate-600 font-medium truncate max-w-[80px] block">
                          Summer Launch
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                          <img src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                        </div>
                        <span className="text-xs text-slate-400">+1</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      2 min ago
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        $245.00
                      </span>
                    </td>
                  </tr>

                  {/* Order 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-slate-600">
                        #ORD-9280
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs text-slate-600 font-medium truncate max-w-[80px] block">
                          Summer Launch
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      5 min ago
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        $129.00
                      </span>
                    </td>
                  </tr>

                  {/* Order 3 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-slate-600">
                        #ORD-9279
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-xs text-slate-500 truncate max-w-[80px] block">
                          Replay: Morning...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                          <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      12 min ago
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700">
                        Processing
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        $340.50
                      </span>
                    </td>
                  </tr>

                  {/* Order 4 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-slate-600">
                        #ORD-9278
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs text-slate-600 font-medium truncate max-w-[80px] block">
                          Summer Launch
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      18 min ago
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        $89.90
                      </span>
                    </td>
                  </tr>

                  {/* Order 5 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-slate-600">
                        #ORD-9277
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-xs text-slate-500 truncate max-w-[80px] block">
                          Direct Store
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                          <img src="https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                          <img src="https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=64&h=64" alt="Product" className="w-6 h-6 rounded-full border border-white object-cover bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      24 min ago
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        $412.00
                      </span>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>

          {/* CTA Footer */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-center">
            <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
              View all orders
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT QUICK ACTIONS */}
      <div className="">
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-base font-medium text-slate-900">
                Active Campaigns
              </h3>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                3
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button className="flex hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600 bg-white border-slate-200 border rounded-lg pt-2 pr-3 pb-2 pl-3 gap-x-2 gap-y-2 items-center">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
              <button className="flex gap-2 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600 bg-white border-slate-200 border rounded-lg pt-2 pr-3 pb-2 pl-3 gap-x-2 gap-y-2 items-center">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort
              </button>
              <button onClick={() => navigate('/campaigns/create')} className="flex hover:bg-slate-800 transition-colors text-xs font-medium text-white bg-slate-900 rounded-lg pt-2 pr-3.5 pb-2 pl-3.5 shadow-sm gap-x-2 gap-y-2 items-center">
                <Plus className="w-3.5 h-3.5" />
                Create Campaign
              </button>
            </div>
          </div>

          {/* List Container */}
          <div className="space-y-3">
            {/* Campaign Item 1 */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      Summer Collection Drop
                    </h4>
                    <div className="flex -space-x-2">
                      <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=1" alt="" />
                      <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=2" alt="" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Live Shopping • Women's Fashion
                  </p>
                </div>

                <div className="flex items-center gap-6 md:gap-10">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">12 Products</span>
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">In 5 days</span>
                  </div>

                  <div className="min-w-[100px]">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                      Planning
                    </span>
                  </div>

                  <div className="flex min-w-[140px] gap-x-3 gap-y-3 items-center">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-[25%] rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      25%
                    </span>
                  </div>

                  <button className="text-slate-300 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign Item 2 */}
            <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      Early Black Friday
                    </h4>
                    <div className="flex -space-x-2">
                      <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=4" alt="" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Recurring Partnership • Electronics
                  </p>
                </div>

                <div className="flex items-center gap-6 md:gap-10">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">45 Products</span>
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">Today, 7:00 PM</span>
                  </div>

                  <div className="min-w-[100px]">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                      Scheduled
                    </span>
                  </div>

                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-[90%] rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      90%
                    </span>
                  </div>

                  <button className="text-slate-300 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid (At the bottom in HTML) */}
        <div className="grid grid-cols-2 md:grid-cols-4 mt-8 mb-8 gap-x-4 gap-y-4">
          <button className="bg-white p-3.5 rounded-md border border-slate-100 shadow-sm hover:shadow-md hover:bg-orange-50/60 hover:border-orange-200 transition-all text-left group flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
              <Video className="w-5 h-5 text-orange-500 transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                New Live Shop
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Start setup wizard
              </p>
            </div>
          </button>

          <button className="bg-white p-3.5 rounded-md border border-slate-100 shadow-sm hover:shadow-md hover:bg-purple-50/60 hover:border-purple-200 transition-all text-left group flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
              <Search className="w-5 h-5 text-purple-600 transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                Find Influencer
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Explore catalog
              </p>
            </div>
          </button>

          <button className="bg-white p-3.5 rounded-md border border-slate-100 shadow-sm hover:shadow-md hover:bg-blue-50/60 hover:border-blue-200 transition-all text-left group flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <PackagePlus className="w-5 h-5 text-blue-500 transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                Import Products
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Via integration
              </p>
            </div>
          </button>

          <button className="bg-white p-3.5 rounded-md border border-slate-100 shadow-sm hover:shadow-md hover:bg-green-50/60 hover:border-green-200 transition-all text-left group flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
              <BarChart2 className="w-5 h-5 text-green-600 transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                Reports
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Check performance
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
