import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppDataProvider } from './store/AppData.tsx';
import './index.css';

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Ukendt fejl' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('LIFE 2.0 render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', background: '#070a14', color: '#e2e8f0', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>LIFE 2.0</h1>
          <p style={{ marginTop: 16, color: '#fbbf24' }}>Appen stødte på en fejl under opstart.</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: 12, padding: 12, borderRadius: 12, background: '#111827', fontSize: 12 }}>{this.state.message}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, borderRadius: 12, padding: '12px 18px', background: '#0891b2', color: '#fff', fontWeight: 600 }}>Prøv igen</button>
        </main>
      );
    }
    return this.props.children;
  }
}

document.getElementById('boot-status')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </AppErrorBoundary>
  </StrictMode>
);
