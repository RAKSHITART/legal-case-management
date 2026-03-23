import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
  ResponsiveContainer
} from 'recharts';
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiArrowRight,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const navigate = useNavigate();

  const COLORS = {
    priority: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    status: ['#2ECC71', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6'],
    practice: ['#1ABC9C', '#3498DB', '#9B59B6', '#E67E22', '#E74C3C', '#2C3E50']
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      console.log('Dashboard API Response:', response.data);

      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label || payload[0].name}</p>
          <p className="text-sm text-blue-600">{`${payload[0].value} cases`}</p>
        </div>
      );
    }
    return null;
  };

  const generateTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      'Open': Math.floor(Math.random() * 5),
      'Closed': Math.floor(Math.random() * 3),
      'In Progress': Math.floor(Math.random() * 4)
    }));
  };

  const timelineData = generateTimelineData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FiAlertCircle className="text-red-500 text-5xl" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasCases = stats?.overview?.totalCases > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Cases</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.overview?.totalCases || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiFolder className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">Active: {stats?.overview?.activeCases || 0}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Closed: {stats?.overview?.closedCases || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.overview?.completionPercentage || 0}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats?.overview?.completionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Cases</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.overview?.activeCases || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiClock className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/cases?status=active" className="text-sm text-blue-600 hover:text-blue-800 flex items-center group">
              View Active Cases
              <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Notifications</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.overview?.unreadNotifications || 0}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            {stats?.overview?.unreadNotifications > 0 ? (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {stats?.overview?.unreadNotifications} unread
              </span>
            ) : (
              <span className="text-xs text-gray-500">All caught up!</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Priority - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiBarChart2 className="mr-2 text-blue-600" />
              Cases by Priority
            </h3>
            {!hasCases && <span className="text-xs text-gray-400">No data</span>}
          </div>

          {hasCases && stats?.charts?.casesByPriority?.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.charts.casesByPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name="Cases"
                  radius={[0, 4, 4, 0]}
                >
                  {stats.charts.casesByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <FiBarChart2 className="text-4xl mb-2 opacity-50" />
              <p>No priority data available</p>
              <p className="text-sm mt-2">Add cases with different priorities</p>
            </div>
          )}
        </div>

        {/* Cases by Status - Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiPieChart className="mr-2 text-green-600" />
              Cases by Status
            </h3>
            {!hasCases && <span className="text-xs text-gray-400">No data</span>}
          </div>

          {hasCases && stats?.charts?.casesByStatus?.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.charts.casesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {stats.charts.casesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.status[index % COLORS.status.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <FiPieChart className="text-4xl mb-2 opacity-50" />
              <p>No status data available</p>
              <p className="text-sm mt-2">Add cases with different statuses</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Practice Area - Horizontal Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiActivity className="mr-2 text-purple-600" />
              Cases by Practice Area
            </h3>
            {!hasCases && <span className="text-xs text-gray-400">No data</span>}
          </div>

          {hasCases && stats?.charts?.casesByPracticeArea?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.charts.casesByPracticeArea}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name="Cases"
                  radius={[0, 4, 4, 0]}
                >
                  {stats.charts.casesByPracticeArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.practice[index % COLORS.practice.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <FiActivity className="text-4xl mb-2 opacity-50" />
              <p>No practice area data available</p>
              <p className="text-sm mt-2">Add cases with different practice areas</p>
            </div>
          )}
        </div>

        {/* Cases Timeline - Area Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-orange-600" />
              Case Activity Timeline
            </h3>
          </div>

          {hasCases ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Open"
                  stackId="1"
                  stroke="#2ECC71"
                  fill="#2ECC71"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="In Progress"
                  stackId="1"
                  stroke="#F39C12"
                  fill="#F39C12"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Closed"
                  stackId="1"
                  stroke="#E74C3C"
                  fill="#E74C3C"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <FiTrendingUp className="text-4xl mb-2 opacity-50" />
              <p>No timeline data available</p>
              <p className="text-sm mt-2">Add cases to see activity timeline</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3 - Cases by Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Outcome - Donut Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiPieChart className="mr-2 text-indigo-600" />
              Cases by Outcome
            </h3>
            {!hasCases && <span className="text-xs text-gray-400">No data</span>}
          </div>

          {hasCases && stats?.charts?.casesByOutcome?.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.charts.casesByOutcome}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {stats.charts.casesByOutcome.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.practice[index % COLORS.practice.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <FiPieChart className="text-4xl mb-2 opacity-50" />
              <p>No outcome data available</p>
              <p className="text-sm mt-2">Add cases with different outcomes</p>
            </div>
          )}
        </div>

        {/* Empty column to maintain grid layout */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* This space can be used for future charts */}
        </div>
      </div>

      {/* Upcoming Hearings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiCalendar className="mr-2 text-blue-600" />
            Upcoming Hearings
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-500">Scheduled</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-500">This Week</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-500">Today</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Case Number</th>
                <th className="table-header">Title</th>
                <th className="table-header">Client</th>
                <th className="table-header">Hearing Date</th>
                <th className="table-header">Time</th>
                <th className="table-header">Location</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.upcomingHearings?.length > 0 ? (
                stats.upcomingHearings.map((hearing) => {
                  const hearingDate = new Date(hearing.hearingDate);
                  const today = new Date();
                  const isToday = hearingDate.toDateString() === today.toDateString();
                  const isThisWeek = hearingDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000;

                  return (
                    <tr
                      key={hearing._id}
                      className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-red-50' : isThisWeek ? 'bg-yellow-50' : ''
                        }`}
                    >
                      <td className="table-cell font-medium">{hearing.caseNumber}</td>
                      <td className="table-cell">{hearing.title}</td>
                      <td className="table-cell">{hearing.client?.name || 'N/A'}</td>
                      <td className="table-cell">{hearingDate.toLocaleDateString()}</td>
                      <td className="table-cell">{hearing.hearingTime}</td>
                      <td className="table-cell">{hearing.courtLocation}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleViewCase(hearing._id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <FiCalendar className="mx-auto text-3xl mb-2 opacity-50" />
                    No upcoming hearings scheduled
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Cases</h3>
          <Link to="/cases" className="text-sm text-blue-600 hover:text-blue-800 flex items-center group">
            View All Cases
            <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Case Number</th>
                <th className="table-header">Title</th>
                <th className="table-header">Client</th>
                <th className="table-header">Status</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Filed Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentCases?.length > 0 ? (
                stats.recentCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{caseItem.caseNumber}</td>
                    <td className="table-cell">{caseItem.title}</td>
                    <td className="table-cell">{caseItem.client?.name || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${caseItem.status === 'Open' ? 'bg-green-100 text-green-800' :
                        caseItem.status === 'Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${caseItem.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                        caseItem.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          caseItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className="table-cell">{new Date(caseItem.filedDate).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleViewCase(caseItem._id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <FiFolder className="mx-auto text-3xl mb-2 opacity-50" />
                    No cases added yet.
                    <Link to="/cases" className="text-blue-600 hover:text-blue-800 ml-1">
                      Add your first case
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;