import Header from "../components/layout/Header";
import CatalogPage from "../pages/catalog/CatalogPage";

function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <CatalogPage />
        </div>
    );
}

export default App;
