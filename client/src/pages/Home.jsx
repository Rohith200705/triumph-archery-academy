import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = ['/gallery/slide-1.svg', '/gallery/slide-2.svg', '/gallery/slide-3.svg'];

const RULES = [
  'Always follow the coach’s commands. Never draw or release an arrow unless the line is clear and “SHOOT” is called.',
  'Arrows may only be collected when everyone is behind the waiting line and the whistle is blown.',
  'Never point or draw a bow at anything or anyone other than the target butt.',
  'Wear proper sports attire and closed footwear. Loose clothing and jewellery are not allowed on the range.',
  'Equipment issued by the academy must be handled with care and returned after class.',
  'No food or drinks on the shooting range. Water bottles are allowed at the seating area.',
  'Report any injury, damaged equipment or unsafe behaviour to a coach immediately.',
  'Mobile phones must be on silent during class. Photography only with permission.'
];

const DOS = [
  'Do arrive 10–15 minutes early and warm up before class.',
  'Do listen carefully to instructions and ask questions if unsure.',
  'Do respect fellow archers, coaches and the academy property.',
  'Do keep your shooting bay tidy — arrows in the quiver, gear in the rack.',
  'Do practise regularly and track your scores in the parent portal.',
  'Do inform the academy in advance if you cannot attend a session.',
  'Do stay hydrated and rest if you feel tired or dizzy.'
];

const DONTS = [
  'Don’t cross the shooting line while others are shooting.',
  'Don’t dry-fire (release without an arrow) any bow.',
  'Don’t use equipment that is not assigned to you.',
  'Don’t run, push or engage in horseplay on the range.',
  'Don’t distract or disturb archers who are aiming.',
  'Don’t remove arrows from the target until the all-clear is given.',
  'Don’t attend class under the influence of alcohol or medication that affects reflexes.'
];

const TERMS = [
  'Admission is confirmed only after review and approval by the academy officials.',
  'Fees, once paid, are non-refundable and non-transferable except at the academy’s discretion.',
  'Class schedules, batches and coaching timings may be revised by the academy with prior notice.',
  'The academy is not liable for personal injuries sustained while violating safety rules.',
  'Photographs or videos taken during classes may be used by the academy for promotional purposes.',
  'Parents/guardians must ensure their ward attends only their allotted batch.',
  'The academy reserves the right to terminate membership for repeated rule violations.',
  'All disputes are subject to the jurisdiction of Chennai courts.'
];

function Section({ title, children, id }) {
  return (
    <section className="home-section" id={id}>
      <h2>{title}</h2>
      <div className="home-section-body">{children}</div>
    </section>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="home">
      <header className="home-nav">
        <div className="home-brand">
          <div className="brand-mark">TA</div>
          <div>
            <div className="brand-name">Triumph Archery Academy</div>
            <div className="brand-tag">Aim · Focus · Triumph</div>
          </div>
        </div>
        <nav>
          <a href="#about">About Us</a>
          <a href="#terms">Terms</a>
          <a href="#rules">Rules</a>
          <a href="#conduct">Do’s &amp; Don’ts</a>
          <Link to="/login" className="btn ghost sm">Login</Link>
          <Link to="/register" className="btn gold sm">Register Now</Link>
        </nav>
      </header>

      <div className="hero">
        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={'hero-slide' + (i === slide ? ' on' : '')}
          />
        ))}
        <div className="hero-overlay">
          <h1>Triumph Archery Academy</h1>
          <p>Train with focus. Shoot with confidence. Triumph on the range.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn gold">Register Now →</Link>
            <a href="#about" className="btn ghost" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-dots">
          {SLIDES.map((src, i) => (
            <button
              key={src}
              className={i === slide ? 'on' : ''}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="home-wrap">
        <Section title="About Us" id="about">
          <p>
            Triumph Archery Academy is a premier archery training academy in Old Perungalathur,
            Chennai, dedicated to nurturing focus, discipline and confidence through the sport of
            archery. Our mission is simple — <b>Aim · Focus · Triumph</b>.
          </p>
          <p>
            We train kids, youth and adults of all experience levels — from first-time shooters to
            competitive archers — on a safe, well-equipped range under certified coaches. Whether
            your goal is fitness, fun, discipline or competition, our structured programs and
            weekend batches make it easy to start and stay consistent.
          </p>
          <div className="home-features">
            <div className="feature"><b>Safe Range</b><span>Supervised shooting with safety-first protocols</span></div>
            <div className="feature"><b>Certified Coaches</b><span>Personal attention for every archer</span></div>
            <div className="feature"><b>All Ages</b><span>Kid (6–12) · Youth (12–18) · Adult (18+)</span></div>
            <div className="feature"><b>Progress Tracking</b><span>Parent portal with scores &amp; progression</span></div>
          </div>
        </Section>

        <Section title="Terms &amp; Conditions" id="terms">
          <ol className="home-list">
            {TERMS.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </Section>

        <Section title="Rules &amp; Regulations" id="rules">
          <ol className="home-list">
            {RULES.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </Section>

        <Section title="Do’s &amp; Don’ts Inside the Academy" id="conduct">
          <div className="conduct-grid">
            <div className="conduct dos">
              <h3>✔ Do’s</h3>
              <ul>{DOS.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
            <div className="conduct donts">
              <h3>✘ Don’ts</h3>
              <ul>{DONTS.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          </div>
        </Section>

        <section className="home-cta">
          <h2>Ready to start your archery journey?</h2>
          <p>Fill the admission form online — it takes only a few minutes. You’ll get a parent login right away to track your ward’s progress.</p>
          <Link to="/register" className="btn gold">Register Now →</Link>
        </section>
      </div>

      <footer className="home-foot">
        <b>TRIUMPH ARCHERY ACADEMY</b> · Parvathi Nagar, Old Perungalathur, Chennai · Phone: 9600019334 &amp; 9094070501
      </footer>
    </div>
  );
}
