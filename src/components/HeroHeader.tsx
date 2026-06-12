interface HeroHeaderProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
}

export function HeroHeader({ title, subtitle, eyebrow }: HeroHeaderProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div style={{ maxWidth: 720 }}>
          {eyebrow && (
            <div
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 12,
                fontWeight: 600,
                color: '#0067b8',
                marginBottom: 12
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 600,
              color: '#171717',
              letterSpacing: '-0.02em'
            }}
          >
            {title}
          </h1>
          <p
            style={{
              marginTop: 16,
              marginBottom: 0,
              fontSize: 18,
              lineHeight: 1.5,
              color: '#3b3b3b',
              maxWidth: 640
            }}
          >
            {subtitle}
          </p>
        </div>
        <div className="hero-art" aria-hidden>
          <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="150" height="110" rx="10" fill="#ffffff" stroke="#cfe4f7" />
            <rect x="36" y="48" width="70" height="10" rx="5" fill="#0067b8" />
            <rect x="36" y="68" width="118" height="8" rx="4" fill="#d7e8f7" />
            <rect x="36" y="84" width="118" height="8" rx="4" fill="#d7e8f7" />
            <rect x="36" y="100" width="80" height="8" rx="4" fill="#d7e8f7" />
            <rect x="36" y="118" width="48" height="14" rx="7" fill="#50b83c" />
            <g transform="translate(150 86)">
              <rect width="110" height="84" rx="10" fill="#0067b8" />
              <rect x="16" y="16" width="24" height="24" rx="3" fill="#f25022" />
              <rect x="44" y="16" width="24" height="24" rx="3" fill="#7fba00" />
              <rect x="16" y="44" width="24" height="24" rx="3" fill="#00a4ef" />
              <rect x="44" y="44" width="24" height="24" rx="3" fill="#ffb900" />
              <path
                d="M80 28 l8 8 l-8 8 M84 36 h-16"
                stroke="#ffffff"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
