import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CsvUploadModal from './components/CsvUploadModal';

// Pages
import OverviewPage from './pages/OverviewPage';
import SalesPage from './pages/SalesPage';
import MarketingPage from './pages/MarketingPage';
import MetaPage from './pages/MetaPage';
import FlipkartPage from './pages/FlipkartPage';
import AmazonPage from './pages/AmazonPage';
import FunnelsPage from './pages/FunnelsPage';
import RegionalPage from './pages/RegionalPage';
import HourlyPage from './pages/HourlyPage';
import CreativesPage from './pages/CreativesPage';
import AdvisorPage from './pages/AdvisorPage';
import ForecastPage from './pages/ForecastPage';
import DataQualityPage from './pages/DataQualityPage';
import ChangeLogPage from './pages/ChangeLogPage';
import CohortPage from './pages/CohortPage';
import SouthPage from './pages/SouthPage';

// API
import {
  fetchOverview, fetchSales, fetchMarketing, fetchMeta,
  fetchAmazon, fetchFlipkart, fetchFunnels, fetchRegional,
  fetchHourly, fetchCreatives, fetchAdvisor, fetchForecast,
  fetchAnomalies, fetchQuality, fetchChanges, syncOrders, syncTracker
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Global Filter State
  const [filters, setFilters] = useState({
    datePreset: 'all',
    marketplace: 'all',
    state: 'all',
    campaign: 'all'
  });

  // State for all data streams
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [marketingData, setMarketingData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [amazonData, setAmazonData] = useState(null);
  const [flipkartData, setFlipkartData] = useState(null);
  const [funnelsData, setFunnelsData] = useState(null);
  const [regionalData, setRegionalData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [creativesData, setCreativesData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  const [changesData, setChangesData] = useState(null);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadAllData = async (forceSync = false) => {
    setIsRefreshing(true);
    try {
      if (forceSync) {
        Promise.allSettled([syncOrders(), syncTracker()]).catch(() => {});
      }

      // Step 1: Instant priority load for primary dashboard metrics
      const [ov, sl, adv, anom] = await Promise.all([
        fetchOverview(filters).catch(err => { console.error(err); return null; }),
        fetchSales().catch(err => { console.error(err); return null; }),
        fetchAdvisor().catch(err => { console.error(err); return null; }),
        fetchAnomalies().catch(err => { console.error(err); return null; })
      ]);

      if (ov) setOverviewData(ov);
      if (sl) setSalesData(sl);
      if (adv) setAdvisorData(adv);
      if (anom) setAnomaliesData(anom);
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());

      // Step 2: Asynchronously hydrate remaining tabs in parallel
      fetchMarketing().then(d => d && setMarketingData(d)).catch(() => {});
      fetchMeta().then(d => d && setMetaData(d)).catch(() => {});
      fetchAmazon().then(d => d && setAmazonData(d)).catch(() => {});
      fetchFlipkart().then(d => d && setFlipkartData(d)).catch(() => {});
      fetchFunnels().then(d => d && setFunnelsData(d)).catch(() => {});
      fetchRegional().then(d => d && setRegionalData(d)).catch(() => {});
      fetchHourly().then(d => d && setHourlyData(d)).catch(() => {});
      fetchCreatives().then(d => d && setCreativesData(d)).catch(() => {});
      fetchForecast().then(d => d && setForecastData(d)).catch(() => {});
      fetchQuality().then(d => d && setQualityData(d)).catch(() => {});
      fetchChanges().then(d => d && setChangesData(d)).catch(() => {});
    } catch (err) {
      console.error('Data load error:', err);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Automated live data polling every 60 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 60000);
    return () => clearInterval(interval);
  }, [filters]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            overviewData={overviewData}
            salesData={salesData}
            advisorData={advisorData}
            anomaliesData={anomaliesData}
            onNavigate={setActiveTab}
          />
        );
      case 'sales':
        return <SalesPage salesData={salesData} />;
      case 'south':
        return <SouthPage />;
      case 'funnels':
        return <FunnelsPage funnelsData={funnelsData} />;
      case 'flipkart':
        return <FlipkartPage flipkartData={flipkartData} onNavigate={setActiveTab} />;
      case 'amazon':
        return <AmazonPage amazonData={amazonData} onNavigate={setActiveTab} />;
      case 'hourly':
        return <HourlyPage hourlyData={hourlyData} />;
      case 'marketing':
        return <MarketingPage marketingData={marketingData} />;
      case 'regional':
        return <RegionalPage regionalData={regionalData} />;
      case 'creatives':
        return <CreativesPage creativesData={creativesData} />;
      case 'quality':
        return (
          <DataQualityPage 
            qualityData={qualityData} 
            onOpenUploadModal={() => setIsUploadModalOpen(true)} 
            onRefresh={loadAllData} 
          />
        );
      case 'advisor':
        return <AdvisorPage advisorData={advisorData} onNavigate={setActiveTab} />;
      case 'forecast':
        return <ForecastPage forecastData={forecastData} />;
      case 'changes':
        return <ChangeLogPage changesData={changesData} onAddChange={loadAllData} />;
      case 'cohort':
        return <CohortPage />;
      default:
        return (
          <OverviewPage
            overviewData={overviewData}
            salesData={salesData}
            advisorData={advisorData}
            anomaliesData={anomaliesData}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        filters={filters}
        setFilters={setFilters}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lastUpdated={lastUpdated}
        dataThrough={overviewData?.control_room?.traffic?.data_through || overviewData?.data_through}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Collapsible Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Ingestion / CSV Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onRefreshData={loadAllData}
      />
    </div>
  );
}
