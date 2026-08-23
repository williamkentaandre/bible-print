import { getCopy, type Locale } from "@/i18n";
import { CONTACT_EMAIL } from "@/lib/print-ticket";

type TestimonialsProps = {
  locale?: Locale;
};

export function Testimonials({ locale = "fr" }: TestimonialsProps) {
  const copy = getCopy(locale);
  const featured = copy.voices.find((voice) => voice.featured) ?? copy.voices[0];
  const others = copy.voices.filter((voice) => voice !== featured);

  return (
    <section className="app-chrome voices" aria-label={copy.voicesLabel}>
      <header className="voices-head">
        <h2>{copy.voicesTitle}</h2>
        <p className="voices-seal">
          <span>{copy.voicesGuarantee}</span>
        </p>
        <p className="voices-guarantee-lead">
          {copy.voicesGuaranteeLead}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {copy.voicesGuaranteeEnd}
        </p>
      </header>

      {featured ? (
        <figure className="voice-hero">
          <span className="voice-mark" aria-hidden="true">
            «
          </span>
          <blockquote>
            <p>{featured.quote}</p>
          </blockquote>
          <figcaption>
            <span className="voice-stars" aria-label={copy.starsLabel}>
              ★★★★★
            </span>
            <cite>{featured.name}</cite>
          </figcaption>
        </figure>
      ) : null}

      {others.length > 0 ? (
        <ul className="voice-grid">
          {others.map((voice) => (
            <li key={voice.name}>
              <figure className="voice-card">
                <span className="voice-stars" aria-label={copy.starsLabel}>
                  ★★★★★
                </span>
                <blockquote>
                  <p>{voice.quote}</p>
                </blockquote>
                <figcaption>
                  <cite>{voice.name}</cite>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
