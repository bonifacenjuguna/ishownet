const socials = [
  { label: 'Instagram', href: 'https://instagram.com/avoenix', icon: InstagramIcon },
  { label: 'TikTok', href: 'https://tiktok.com/@avoenix', icon: TikTokIcon },
  { label: 'GitHub', href: 'https://github.com/bonifacenjuguna', icon: GitHubIcon },
  { label: 'Telegram', href: 'https://t.me/avoenix', icon: TelegramIcon },
  { label: 'X', href: 'https://x.com/Avoenix_', icon: XIcon },
  { label: 'YouTube', href: 'https://youtube.com/@Avoenix', icon: YouTubeIcon },
  { label: 'Facebook', href: 'https://facebook.com/Avoenix', icon: FacebookIcon },
];

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" /></svg>;
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.8 4.2c.5 2.4 1.8 3.8 4.2 4.1v3.1a8.4 8.4 0 0 1-4.2-1.4v5.7a5.1 5.1 0 1 1-4.4-5v3.1a2.1 2.1 0 1 0 1.3 2v-11.6h3.1Z" fill="currentColor" /></svg>;
}

function GitHubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.2-.3-4.5-1.1-4.5-4.8 0-1.1.4-2 .9-2.7-.1-.2-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.7.6.7.9 1.6.9 2.7 0 3.7-2.3 4.5-4.5 4.8.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z" fill="currentColor" /></svg>;
}

function TelegramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 4.1 3.5 10.9c-1.2.5-1.2 1.1-.2 1.4l4.5 1.4 1.7 5.2c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8l3-14.2c.3-1.4-.5-2-1.8-1.4Zm-12.7 9.3 10.8-6.8c.5-.3 1-.1.6.2l-8.8 8-.3 3.1-1.3-4.5-1-.3Z" fill="currentColor" /></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4.1l3.3 4.7L16.4 4H19l-5.4 6.1L19.5 20h-4.1l-3.8-5.4L6.7 20H4.1l5.8-6.6L5 4Zm3.8 1.8H7.5l7.8 12.4h1.3L8.8 5.8Z" fill="currentColor" /></svg>;
}

function YouTubeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 7.1a2.8 2.8 0 0 0-2-2C17.4 4.6 12 4.6 12 4.6s-5.4 0-7.2.5a2.8 2.8 0 0 0-2 2C2.3 8.9 2.3 12 2.3 12s0 3.1.5 4.9a2.8 2.8 0 0 0 2 2c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-4.9.5-4.9s0-3.1-.5-4.9ZM10.1 15.6V8.4l6 3.6-6 3.6Z" fill="currentColor" /></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H7.7v3H10v8h3.5Z" fill="currentColor" /></svg>;
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-socials" aria-label="iShowNet social links">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              className="footer-social"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
            >
              <Icon />
            </a>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} iShowNet. All rights reserved.</span>
          <span className="powered">
            Powered by <strong>Vercel Edge</strong> · Built with <strong>Next.js</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}
