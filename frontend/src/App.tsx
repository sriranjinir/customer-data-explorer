import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CustomerTable } from "./components/CustomerTable";

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <header className="p-4 bg-blue-600 text-white shadow-md">
                    <h1 className="text-2xl font-bold">Customer Data Explorer</h1>
                </header>

                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<CustomerTable />} />
                    </Routes>
                </main>

                <footer className="p-4 bg-gray-200 text-center text-sm text-gray-600">
                    &copy; {new Date().getFullYear()} Customer Data Explorer
                </footer>
            </div>
        </Router>
    );
}