import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <Outlet />
        </div>
    );
}

export default App;
