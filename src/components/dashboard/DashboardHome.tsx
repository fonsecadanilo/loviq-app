import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, DollarSign, Eye, ShoppingCart, Store } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: 'Total Revenue',
      value: '$24,580',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Campaigns',
      value: '8',
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Views',
      value: '45,230',
      icon: Eye,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Conversions',
      value: '1,247',
      icon: ShoppingCart,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  const recentCampaigns = [
    {
      name: 'Summer Fashion Collection',
      status: 'Active',
      revenue: '$8,450',
      views: '12,340',
      conversion: '3.2%'
    },
    {
      name: 'Tech Gadgets Launch',
      status: 'Active',
      revenue: '$6,230',
      views: '8,920',
      conversion: '2.8%'
    },
    {
      name: 'Beauty Essentials',
      status: 'Completed',
      revenue: '$9,900',
      views: '24,150',
      conversion: '4.1%'
    }
  ];

  const recommendedInfluencers = [
    {
      name: 'Sarah Chen',
      category: 'Fashion & Beauty',
      followers: '125K',
      rating: 4.9,
      conversion: '4.2%'
    },
    {
      name: 'Mike Johnson',
      category: 'Tech & Gadgets',
      followers: '89K',
      rating: 4.8,
      conversion: '3.8%'
    },
    {
      name: 'Emma Wilson',
      category: 'Lifestyle',
      followers: '203K',
      rating: 4.7,
      conversion: '5.1%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's what's happening with your campaigns today.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="inline-flex items-center gap-2 bg-[#7D2AE8] text-white px-4 py-2 rounded-lg hover:bg-[#6d24ca] transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span className="truncate">Create New Campaign</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-[#E2E8F0]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <div className="xl:col-span-2">
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Campaigns</CardTitle>
                  <CardDescription>Your latest campaign performance</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{campaign.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                          }`}>
                          {campaign.status}
                        </span>
                        <span>{campaign.views} views</span>
                        <span>{campaign.conversion} conversion</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{campaign.revenue}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Influencers */}
        <div>
          <Card className="border-[#E2E8F0]">
            <CardHeader>
              <div>
                <CardTitle>Recommended Influencers</CardTitle>
                <CardDescription>Top performers in your niche</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedInfluencers.map((influencer, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{influencer.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{influencer.category}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>{influencer.followers} followers</span>
                        <span>⭐ {influencer.rating}</span>
                        <span>{influencer.conversion} conv.</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">Invite</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7D2AE8]/10 rounded-xl flex items-center justify-center mx-auto">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#7D2AE8]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Create Campaign</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Start a new live commerce campaign</p>
              <Button variant="primary" size="sm" className="w-full text-xs sm:text-sm" onClick={() => navigate('/campaigns/create')}>Get Started</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Integrate Store</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Connect your ecommerce platform</p>
              <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">Connect</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">View Analytics</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Detailed performance insights</p>
              <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">View Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
