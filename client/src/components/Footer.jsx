import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: '32px 0',
      marginTop: 64,
      background: 'var(--color-surface)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--color-accent)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontFamily: 'var(--font-display)', color: 'white'
          }}>B</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>BlogForge</span>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>— Write. Share. Connect.</span>
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} BlogForge. Built with React + Node.js.
        </div>
      </div>
    </footer>
  );
}
