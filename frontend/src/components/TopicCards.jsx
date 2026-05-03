const TOPICS = [
  {
    emoji: '🏛️',
    title: 'Indian Democracy Basics',
    summary:
      'Parliamentary system, Constitution (Part XV, Articles 324–329), universal adult suffrage, Lok Sabha & Rajya Sabha.',
  },
  {
    emoji: '⚖️',
    title: 'Election Commission of India',
    summary:
      'Autonomous constitutional body — CEC, election commissioners, SVEEP, cVIGIL, and Voter Helpline 1950.',
  },
  {
    emoji: '🗳️',
    title: 'Types of Elections',
    summary:
      'Lok Sabha, Rajya Sabha, State Assembly, Local Body, Presidential, By-Elections — FPTP & STV systems.',
  },
  {
    emoji: '📋',
    title: 'Voter Registration',
    summary:
      'Eligibility (18+), Form 6 on NVSP portal, EPIC/Voter ID, e-EPIC, NRI voting, and the Voter Helpline app.',
  },
  {
    emoji: '📅',
    title: 'Election Timeline',
    summary:
      'Announcement → Nomination → Scrutiny → Withdrawal → Campaigning → Silence Period → Polling → Counting → Government Formation.',
  },
  {
    emoji: '🖲️',
    title: 'EVM & VVPAT',
    summary:
      'How Electronic Voting Machines work, M3 EVMs, VVPAT paper trail, ballot unit & control unit, security features.',
  },
  {
    emoji: '🗓️',
    title: 'Voting Process',
    summary:
      'Step-by-step polling day guide — ID check, indelible ink, casting vote on EVM, VVPAT verification, postal ballots.',
  },
  {
    emoji: '📜',
    title: 'Model Code of Conduct',
    summary:
      'Rules for parties and government during elections — campaign restrictions, monitoring, enforcement, cVIGIL app.',
  },
  {
    emoji: '🏆',
    title: 'Post-Election Process',
    summary:
      'Counting procedure, election petitions, recounts, government formation, coalition politics, transition of power.',
  },
  {
    emoji: '📖',
    title: 'Key Legislation',
    summary:
      'RPA 1950 & 1951, Anti-Defection Law (10th Schedule), Delimitation Act, Constitutional Amendments on elections.',
  },
];

export default function TopicCards() {
  return (
    <section aria-label="Election topics">
      <h2 className="text-lg font-bold text-navy mb-2">Explore Topics</h2>
      <p className="text-sm text-gray-500 mb-6">
        Browse key topics about the Indian election process. Switch to the <strong>Ask</strong> tab
        to dive deeper into any topic.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
        {TOPICS.map((t, i) => (
          <article
            key={i}
            role="listitem"
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-saffron transition-all focus-within:ring-2 focus-within:ring-navy"
            tabIndex={0}
            aria-label={t.title}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">{t.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{t.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.summary}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
