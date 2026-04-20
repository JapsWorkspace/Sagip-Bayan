import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';
import '../css/AdminAnalytics.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://gaganadapat.onrender.com';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWhole(value) {
  return new Intl.NumberFormat().format(safeNumber(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [evacSummary, setEvacSummary] = useState({
    totalPlaces: 0,
    statusCounts: { available: 0, limited: 0, full: 0 },
    totalIndividualCapacity: 0,
    totalFamilyCapacity: 0,
    totalBedCapacity: 0,
    permanentCount: 0,
    covidFacilities: 0,
  });

  const [incidentStats, setIncidentStats] = useState({
    reported: 0,
    onProcess: 0,
    resolved: 0,
    total: 0,
  });
  const [incidentTrend, setIncidentTrend] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState({});

  const [inventorySummary, setInventorySummary] = useState({
    totalEntries: 0,
    goodsEntries: 0,
    monetaryEntries: 0,
    totalGoodsQuantity: 0,
    totalMonetaryAmount: 0,
    recentDonations: 0,
  });
  const [inventoryCategoryStats, setInventoryCategoryStats] = useState({});
  const [inventorySourceStats, setInventorySourceStats] = useState({});
  const [inventoryTrend, setInventoryTrend] = useState([]);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchAllAnalytics = async (backgroundRefresh = false) => {
      if (!mounted) return;
      if (backgroundRefresh) setRefreshing(true);

      try {
        const [
          evacRes,
          incidentStatsRes,
          incidentTrendRes,
          incidentTypesRes,
          inventorySummaryRes,
          inventoryCategoryRes,
          inventorySourceRes,
          inventoryTrendRes,
        ] = await Promise.allSettled([
          axios.get(`${BASE_URL}/evacs/analytics/summary`, { withCredentials: true }),
          axios.get(`${BASE_URL}/incident/stats`, { withCredentials: true }),
          axios.get(`${BASE_URL}/incident/trend`, { withCredentials: true }),
          axios.get(`${BASE_URL}/incident/typeStats`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/inventory/analytics/summary`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/inventory/analytics/category-stats`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/inventory/analytics/source-stats`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/inventory/analytics/recent-trend`, { withCredentials: true }),
        ]);

        if (!mounted) return;

        if (evacRes.status === 'fulfilled') {
          setEvacSummary(evacRes.value?.data || {});
        }

        if (incidentStatsRes.status === 'fulfilled') {
          setIncidentStats(incidentStatsRes.value?.data || {});
        }

        if (incidentTrendRes.status === 'fulfilled') {
          setIncidentTrend(Array.isArray(incidentTrendRes.value?.data) ? incidentTrendRes.value.data : []);
        }

        if (incidentTypesRes.status === 'fulfilled') {
          setIncidentTypes(incidentTypesRes.value?.data || {});
        }

        if (inventorySummaryRes.status === 'fulfilled') {
          setInventorySummary(inventorySummaryRes.value?.data || {});
        }

        if (inventoryCategoryRes.status === 'fulfilled') {
          setInventoryCategoryStats(inventoryCategoryRes.value?.data || {});
        }

        if (inventorySourceRes.status === 'fulfilled') {
          setInventorySourceStats(inventorySourceRes.value?.data || {});
        }

        if (inventoryTrendRes.status === 'fulfilled') {
          setInventoryTrend(Array.isArray(inventoryTrendRes.value?.data) ? inventoryTrendRes.value.data : []);
        }
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchAllAnalytics(false);

    const interval = setInterval(() => {
      fetchAllAnalytics(true);
    }, 12000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const analyticsModules = [
    { key: 'inventory', label: 'Inventory', sub: 'Donations & stocks' },
    { key: 'incidents', label: 'Incident Reports', sub: 'Review incidents' },
    { key: 'evacuation', label: 'Evacuation', sub: 'Centers & status' },
  ];

  const commonChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: '#052e16',
          titleColor: '#ffffff',
          bodyColor: '#dcfce7',
          padding: 10,
          cornerRadius: 10,
        },
      },
      scales: {
        x: {
          ticks: { color: '#14532d', font: { size: 11, weight: '600' } },
          grid: { color: 'rgba(20, 83, 45, 0.08)' },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#14532d', font: { size: 11, weight: '600' } },
          grid: { color: 'rgba(20, 83, 45, 0.08)' },
          border: { display: false },
        },
      },
    };
  }, []);

  const inventoryCards = [
    { label: 'Goods Entries', value: loading ? '—' : formatWhole(inventorySummary.goodsEntries), tone: 'emerald' },
    { label: 'Monetary Entries', value: loading ? '—' : formatWhole(inventorySummary.monetaryEntries), tone: 'teal' },
    { label: 'Recent Donations', value: loading ? '—' : formatWhole(inventorySummary.recentDonations), tone: 'gold' },
  ];

  const incidentCards = [
    { label: 'Reported', value: loading ? '—' : formatWhole(incidentStats.reported), tone: 'gold' },
    { label: 'On Process', value: loading ? '—' : formatWhole(incidentStats.onProcess), tone: 'amber' },
    { label: 'Resolved', value: loading ? '—' : formatWhole(incidentStats.resolved), tone: 'green' },
    { label: 'Total Incidents', value: loading ? '—' : formatWhole(incidentStats.total), tone: 'slate' },
  ];

  const evacuationCards = [
    { label: 'Limited', value: loading ? '—' : formatWhole(evacSummary.statusCounts?.limited), tone: 'lime' },
    { label: 'Full', value: loading ? '—' : formatWhole(evacSummary.statusCounts?.full), tone: 'red' },
    { label: 'Family Capacity', value: loading ? '—' : formatWhole(evacSummary.totalFamilyCapacity), tone: 'forest' },
    { label: 'Permanent Centers', value: loading ? '—' : formatWhole(evacSummary.permanentCount), tone: 'gold' },
    { label: 'Covid Facilities', value: loading ? '—' : formatWhole(evacSummary.covidFacilities), tone: 'amber' },
  ];

  const inventoryCategoryChart = useMemo(() => {
    const labels = Object.keys(inventoryCategoryStats || {}).map((item) => item || 'Uncategorized');
    const values = Object.values(inventoryCategoryStats || {}).map((value) => safeNumber(value));

    return {
      labels,
      datasets: [
        {
          label: 'Quantity',
          data: values,
          backgroundColor: '#16a34a',
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 54,
        },
      ],
    };
  }, [inventoryCategoryStats]);

  const inventorySourceChart = useMemo(() => {
    return {
      labels: ['External', 'Government', 'Internal'],
      datasets: [
        {
          data: [
            safeNumber(inventorySourceStats.external),
            safeNumber(inventorySourceStats.government),
            safeNumber(inventorySourceStats.internal),
          ],
          backgroundColor: ['#22c55e', '#10b981', '#14532d'],
          borderWidth: 0,
        },
      ],
    };
  }, [inventorySourceStats]);

  const inventoryTrendChart = useMemo(() => {
    return {
      labels: (inventoryTrend || []).map((item) => item?._id || ''),
      datasets: [
        {
          label: 'Entries',
          data: (inventoryTrend || []).map((item) => safeNumber(item?.count)),
          borderColor: '#15803d',
          backgroundColor: 'rgba(21, 128, 61, 0.12)',
          fill: true,
          tension: 0.34,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [inventoryTrend]);

  const incidentTrendChart = useMemo(() => {
    return {
      labels: (incidentTrend || []).map((item) => item?._id || ''),
      datasets: [
        {
          label: 'Incidents',
          data: (incidentTrend || []).map((item) => safeNumber(item?.count)),
          borderColor: '#15803d',
          backgroundColor: 'rgba(21, 128, 61, 0.12)',
          fill: true,
          tension: 0.34,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [incidentTrend]);

  const incidentTypeChart = useMemo(() => {
    const orderedTypes = ['flood', 'fire', 'earthquake', 'typhoon'];

    return {
      labels: orderedTypes.map((item) => item.charAt(0).toUpperCase() + item.slice(1)),
      datasets: [
        {
          label: 'Incidents',
          data: orderedTypes.map((key) => safeNumber(incidentTypes?.[key])),
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#10b981'],
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 54,
        },
      ],
    };
  }, [incidentTypes]);

  const evacuationStatusChart = useMemo(() => {
    return {
      labels: ['Available', 'Limited', 'Full'],
      datasets: [
        {
          label: 'Centers',
          data: [
            safeNumber(evacSummary.statusCounts?.available),
            safeNumber(evacSummary.statusCounts?.limited),
            safeNumber(evacSummary.statusCounts?.full),
          ],
          backgroundColor: ['#16a34a', '#84cc16', '#ef4444'],
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 54,
        },
      ],
    };
  }, [evacSummary]);

  const evacuationCapacityChart = useMemo(() => {
    return {
      labels: ['Individual', 'Family', 'Bed'],
      datasets: [
        {
          label: 'Capacity',
          data: [
            safeNumber(evacSummary.totalIndividualCapacity),
            safeNumber(evacSummary.totalFamilyCapacity),
            safeNumber(evacSummary.totalBedCapacity),
          ],
          backgroundColor: ['#16a34a', '#10b981', '#14532d'],
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 54,
        },
      ],
    };
  }, [evacSummary]);

  const sectionConfig = {
    inventory: {
      title: 'Inventory Analytics',
      subtitle: 'Donation inventory overview',
      highlightCards: [
        {
          label: 'Total Entries',
          value: loading ? '—' : formatWhole(inventorySummary.totalEntries),
          helper: 'All donation records',
          tone: 'green',
        },
        {
          label: 'Goods Quantity',
          value: loading ? '—' : formatWhole(inventorySummary.totalGoodsQuantity),
          helper: 'Current goods volume',
          tone: 'teal',
        },
        {
          label: 'Monetary Value',
          value: loading ? '—' : formatMoney(inventorySummary.totalMonetaryAmount),
          helper: 'Total recorded amount',
          tone: 'forest',
        },
      ],
      cards: inventoryCards,
      charts: [
        {
          key: 'inventory-category',
          title: 'Inventory by Category',
          element: <Bar data={inventoryCategoryChart} options={commonChartOptions} />,
        },
        {
          key: 'inventory-trend',
          title: 'Recent Donation Trend',
          element: <Line data={inventoryTrendChart} options={commonChartOptions} />,
        },
        {
          key: 'inventory-source',
          title: 'Donation Sources',
          element: (
            <Doughnut
              data={inventorySourceChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#14532d',
                      font: { size: 11, weight: '700' },
                    },
                  },
                },
              }}
            />
          ),
          full: true,
        },
      ],
    },
    incidents: {
      title: 'Incident Report Analytics',
      subtitle: 'Incident monitoring overview',
      highlightCards: [
        {
          label: 'Total Incidents',
          value: loading ? '—' : formatWhole(incidentStats.total),
          helper: 'All reported incidents',
          tone: 'green',
        },
        {
          label: 'Reported',
          value: loading ? '—' : formatWhole(incidentStats.reported),
          helper: 'Newly reported cases',
          tone: 'gold',
        },
        {
          label: 'Resolved',
          value: loading ? '—' : formatWhole(incidentStats.resolved),
          helper: 'Completed incidents',
          tone: 'teal',
        },
      ],
      cards: incidentCards,
      charts: [
        {
          key: 'incident-trend',
          title: 'Incident Trend',
          element: <Line data={incidentTrendChart} options={commonChartOptions} />,
        },
        {
          key: 'incident-types',
          title: 'Incident Type Distribution',
          element: <Bar data={incidentTypeChart} options={commonChartOptions} />,
        },
      ],
    },
    evacuation: {
      title: 'Evacuation Analytics',
      subtitle: 'Evacuation center overview',
      highlightCards: [
        {
          label: 'Total Centers',
          value: loading ? '—' : formatWhole(evacSummary.totalPlaces),
          helper: 'Registered evacuation sites',
          tone: 'green',
        },
        {
          label: 'Available Centers',
          value: loading ? '—' : formatWhole(evacSummary.statusCounts?.available),
          helper: 'Ready for accommodation',
          tone: 'teal',
        },
        {
          label: 'Individual Capacity',
          value: loading ? '—' : formatWhole(evacSummary.totalIndividualCapacity),
          helper: 'Total individual accommodation spaces',
          tone: 'forest',
        },
      ],
      cards: evacuationCards,
      charts: [
        {
          key: 'evac-status',
          title: 'Evacuation Center Status',
          element: <Bar data={evacuationStatusChart} options={commonChartOptions} />,
        },
        {
          key: 'evac-capacity',
          title: 'Capacity Distribution',
          element: <Bar data={evacuationCapacityChart} options={commonChartOptions} />,
        },
      ],
    },
  };

  const currentSection = sectionConfig[selectedModule];

  return (
    <DashboardShell>
      <div className="analytics-page">
        <div className="analytics-scroll">
          <div className="analytics-container">
            <header className="analytics-header analytics-header--dashboard">
              <div className="analytics-header-main">
                <div className="analytics-badge-row">
                  <span className="analytics-badge">Operations Overview</span>
                  {refreshing && (
                    <span className="analytics-badge analytics-badge--live">Refreshing</span>
                  )}
                </div>

                <h2 className="analytics-title">Admin Analytics</h2>
              </div>

              <div className="analytics-header-tools">
                <button
                  type="button"
                  className="analytics-btn analytics-btn--ghost"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </header>

            <section className="analytics-tabs-shell">
              <div className="analytics-tabs-head">
                <div className="analytics-section-copy">
                  <span className="analytics-section-kicker">{currentSection.title}</span>
                  <p>{currentSection.subtitle}</p>
                </div>
              </div>

              <div className="analytics-tabs">
                {analyticsModules.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`analytics-tab ${selectedModule === item.key ? 'is-active' : ''}`}
                    onClick={() => setSelectedModule(item.key)}
                  >
                    <span className="analytics-tab-title">{item.label}</span>
                    <span className="analytics-tab-sub">{item.sub}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="analytics-highlight-grid">
              {currentSection.highlightCards.map((item) => (
                <div
                  key={item.label}
                  className={`analytics-highlight-card analytics-highlight-card--${item.tone}`}
                >
                  <div className="analytics-highlight-label">{item.label}</div>
                  <div className="analytics-highlight-value">{item.value}</div>
                  <div className="analytics-highlight-helper">{item.helper}</div>
                </div>
              ))}
            </section>

            <section className="analytics-metric-grid">
              {currentSection.cards.map((card) => (
                <div key={card.label} className={`a-metric-card a-metric-card--${card.tone}`}>
                  <div className="a-metric-label">{card.label}</div>
                  <div className="a-metric-value">{card.value}</div>
                </div>
              ))}
            </section>

            <section className="analytics-chart-grid">
              {currentSection.charts.map((chart) => (
                <div
                  key={chart.key}
                  className={`a-card a-chart-card ${chart.full ? 'a-chart-card--full' : ''}`}
                >
                  <div className="a-card-head">
                    <div className="a-card-title">{chart.title}</div>
                  </div>
                  <div className="a-chart-body">{chart.element}</div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}