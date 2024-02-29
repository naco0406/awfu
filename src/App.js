import logo from './logo.svg';
// import './App.css';
import { Div, Text, Button } from 'atomize';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Home from './pages/Home';
import Search from './pages/Search';
import Globe from './pages/Globe';
import GeoTiffViewer from './pages/GeoTIFF';
import NetCDFViewer from './pages/netCDF';

function App() {
  return (
    <Router>
      <Div d="flex" flexDir="column" h="100vh">
        <Header />
        <Div flexGrow="1" overflowY="auto">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/globe" element={<Globe />} />
            <Route path="/geotiff" element={<GeoTiffViewer />} />
            <Route path="/netcdf" element={<NetCDFViewer />} />
          </Routes>
        </Div>
        <Footer />
      </Div>
    </Router>
  );
}

export default App;
