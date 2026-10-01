import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import AppProviders from "./providers";

function App() {
    return (
        <AppProviders>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Header />
                <Outlet />
            </div>
        </AppProviders>
    );
}

export default App;
