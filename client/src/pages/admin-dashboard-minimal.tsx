import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboardMinimal() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState<any>(null);
  const auth = useAuth();

  useEffect(() => {
    console.log("Minimal Admin Dashboard mounted");
    console.log("Auth state:", auth);

    if (!auth.loading) {
      if (!auth.user) {
        setStatus("not-authenticated");
      } else if (!auth.isAdmin) {
        setStatus("not-admin");
      } else {
        setStatus("ready");
        setData({
          user: auth.user,
          permissions: {
            isSuperAdmin: auth.isSuperAdmin,
            canManageUsers: auth.canManageUsers,
            canManageFinance: auth.canManageFinance,
            canManageEvents: auth.canManageEvents
          }
        });
      }
    }
  }, [auth]);

  const testAPI = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      const result = await response.json();
      console.log(`${endpoint} response:`, result);
      alert(`${endpoint}: ${response.ok ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      alert(`${endpoint}: ERROR\n${error}`);
    }
  };

  if (status === "loading" || auth.loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff'
      }}>
        <div>
          <h1>Loading Admin Dashboard...</h1>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "not-authenticated") {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2'
      }}>
        <div>
          <h1>Not Authenticated</h1>
          <p>Please log in to access the admin dashboard.</p>
          <button onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fefce8'
      }}>
        <div>
          <h1>Access Denied</h1>
          <p>You don't have admin permissions.</p>
          <p>Your role: {auth.user?.role}</p>
          <button onClick={() => window.location.href = '/dashboard'}>
            Go to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f0fdf4'
    }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>✅ Minimal Admin Dashboard Working!</h1>
        <p>Welcome, {auth.user?.firstName} {auth.user?.lastName}</p>
      </header>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* User Info Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2>User Information</h2>
          <ul>
            <li><strong>Email:</strong> {auth.user?.email}</li>
            <li><strong>Role:</strong> {auth.user?.role}</li>
            <li><strong>Super Admin:</strong> {auth.isSuperAdmin ? 'Yes' : 'No'}</li>
            <li><strong>Can Manage Users:</strong> {auth.canManageUsers ? 'Yes' : 'No'}</li>
            <li><strong>Can Manage Finance:</strong> {auth.canManageFinance ? 'Yes' : 'No'}</li>
            <li><strong>Can Manage Events:</strong> {auth.canManageEvents ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        {/* API Tests */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2>API Tests</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => testAPI('/api/health')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Health
            </button>

            <button
              onClick={() => testAPI('/api/events')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Events
            </button>

            <button
              onClick={async () => {
                try {
                  const { data: { session } } = await (window as any).supabase?.auth?.getSession();
                  if (session?.access_token) {
                    const response = await fetch('/api/admin/users', {
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`
                      }
                    });
                    const result = await response.json();
                    alert(`Admin Users: ${response.ok ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(result, null, 2)}`);
                  } else {
                    alert('No session token available');
                  }
                } catch (error) {
                  alert(`Admin API Error: ${error}`);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Admin API
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2>Navigation</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/admin-dashboard'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Full Admin Dashboard
            </button>

            <button
              onClick={() => window.location.href = '/admin-debug'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Debug Dashboard
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Home
            </button>

            <button
              onClick={() => auth.logout()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Debug Data */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2>Debug Data</h2>
          <pre style={{
            backgroundColor: '#f3f4f6',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
