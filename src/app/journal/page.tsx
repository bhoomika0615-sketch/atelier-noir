import Link from "next/link";

export default function JournalPage() {
  return (
    <main className="container section journal-page">
      <header className="journal-intro">
        <div className="eyebrow">Notes on form and function</div>
        <h1 className="section-title">The journal<span className="title-period">.</span></h1>
        <p>An evolving perspective on modern menswear, considered materials and the details that make a wardrobe personal.</p>
      </header>
      <section className="journal-feature" aria-labelledby="journal-feature-title">
        <div className="journal-feature-art" aria-hidden="true">
          <span>ATELIER NOIR</span>
          <span>FORM / FUNCTION / FEELING</span>
        </div>
        <div className="journal-feature-copy">
          <div className="eyebrow">A note from the studio</div>
          <h2 id="journal-feature-title">A wardrobe, considered.</h2>
          <p>We believe the best pieces make space for the person wearing them. The journal will grow with the collection, sharing the materials, references and ideas behind each edit.</p>
          <Link className="text-link" href="/shop">Explore the collection <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </main>
  );
}