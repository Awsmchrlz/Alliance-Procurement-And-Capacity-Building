import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboardDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = useAuth();

  useEffect(() => {
    console.log("AdminDashboardDebug: Component mounted");

    try {
      setDebugInfo({
        authUser: auth.user,
        isAdmin: auth.isAdmin,
        isSuperAdmin: auth.isSuperAdmin,
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        timestamp: new Date().toISOString()
      });

      console.log("Auth state:", auth);
      setLoading(false);
    } catch (err: any) {
      console.error("Error in AdminDashboardDebug:", err);
      setError(err.message || "Unknown error");
      setLoading(false);
    }
  }, [auth]);

  if (loading) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        <h1>Debug Admin Dashboard - Loading...</h1>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #ccc',
          borderTop: '3px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#ffe6e6' }}>
        <h1>Debug Admin Dashboard - Error</h1>
        <div style={{
          backgroundColor: '#ffcccc',
          padding: '15px',
          border: '1px solid #ff0000',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#e6ffe6' }}>
      <h1>Debug Admin Dashboard - Working!</h1>

      <div style={{ marginTop: '20px' }}>
        <h2>Authentication Debug Info:</h2>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          overflow: 'auto'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Browser Info:</h2>
        <ul style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
          <li><strong>URL:</strong> {window.location.href}</li>
          <li><strong>User Agent:</strong> {navigator.userAgent}</li>
          <li><strong>Screen Size:</strong> {window.screen.width} x {window.screen.height}</li>
          <li><strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Test API Endpoints:</h2>
        <button
          onClick={async () => {
            try {
              console.log("Testing /api/health endpoint...");
              const response = await fetch('/api/health');
              const data = await response.json();
              console.log("Health check response:", data);
              alert(`Health check: ${response.ok ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(data, null, 2)}`);
            } catch (err) {
              console.error("Health check failed:", err);
              alert(`Health check FAILED: ${err}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Health Endpoint
        </button>

        <button
          onClick={async () => {
            try {
              console.log("Testing /api/events endpoint...");
              const response = await fetch('/api/events');
              const data = await response.json();
              console.log("Events response:", data);
              alert(`Events: ${response.ok ? 'SUCCESS' : 'FAILED'}\nFound ${Array.isArray(data) ? data.length : 0} events`);
            } catch (err) {
              console.error("Events fetch failed:", err);
              alert(`Events fetch FAILED: ${err}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Events Endpoint
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Navigation:</h2>
        <button
          onClick={() => window.location.href = '/admin-dashboard'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Go to Real Admin Dashboard
        </button>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
