import { useAppStore } from "./store/appStore";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Config } from "./views/Config";
import { Exec } from "./views/Exec";
import { Log } from "./views/Log";
import "./App.scss";

function App() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <Dashboard />;
      case "config":
        return <Config />;
      case "exec":
        return <Exec />;
      case "log":
        return <Log />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
