export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Speednett. All rights reserved.</span>
          <span className="powered">
            Powered by <strong>Vercel Edge</strong> · Built with <strong>Next.js</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}
