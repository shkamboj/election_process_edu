const STEPS = [
  {
    phase: 'Pre-Election',
    color: 'bg-saffron',
    steps: [
      {
        title: 'Election Announcement',
        detail:
          'The Election Commission announces the election schedule. The Model Code of Conduct comes into effect immediately.',
      },
      {
        title: 'Notification Issued',
        detail:
          'The President (Lok Sabha) or Governor (State Assembly) issues a formal notification calling upon constituencies to elect members. Issued ~7 days before the last date for nominations.',
      },
    ],
  },
  {
    phase: 'Nomination',
    color: 'bg-amber-500',
    steps: [
      {
        title: 'Filing of Nominations',
        detail:
          'Candidates file nomination papers with the Returning Officer, including an affidavit of assets, criminal record, and educational qualifications. Security deposit: ₹25,000 (general) / ₹12,500 (SC/ST) for Lok Sabha.',
      },
      {
        title: 'Scrutiny',
        detail:
          'The Returning Officer examines all nominations the day after filing closes. Invalid nominations are rejected.',
      },
      {
        title: 'Withdrawal',
        detail:
          'Candidates may withdraw within 2 days after scrutiny. The final list of contesting candidates is then published.',
      },
    ],
  },
  {
    phase: 'Campaigning',
    color: 'bg-india_green',
    steps: [
      {
        title: 'Election Campaign',
        detail:
          'Rallies, advertisements, door-to-door canvassing, and social media campaigns. Governed by the Model Code of Conduct. ECI monitors through flying squads and the cVIGIL app.',
      },
      {
        title: 'Silence Period',
        detail:
          'All campaigning stops 48 hours before polling. No rallies, ads, or canvassing allowed — voters reflect and decide freely.',
      },
    ],
  },
  {
    phase: 'Polling',
    color: 'bg-blue-600',
    steps: [
      {
        title: 'Polling Day(s)',
        detail:
          'Voting happens at designated polling stations (7 AM – 6 PM). Multi-phase polling for large states — e.g., 7 phases in 2024 Lok Sabha. Voters use EVMs with VVPAT verification.',
      },
      {
        title: 'Sealing & Storage',
        detail:
          'EVMs are sealed in the presence of polling agents, transported to strong rooms under security escort, and guarded 24/7 with CCTV until counting day.',
      },
    ],
  },
  {
    phase: 'Counting & Results',
    color: 'bg-purple-600',
    steps: [
      {
        title: 'Counting of Votes',
        detail:
          'Postal ballots counted first, then EVM votes round by round. 5 random VVPAT machines per constituency are verified against EVM counts. Results updated live on results.eci.gov.in.',
      },
      {
        title: 'Results Declared',
        detail:
          'The Returning Officer declares the winning candidate who receives a Certificate of Election. Results published in the Official Gazette.',
      },
    ],
  },
  {
    phase: 'Government Formation',
    color: 'bg-navy',
    steps: [
      {
        title: 'Invitation to Form Government',
        detail:
          'The President invites the leader of the majority party/coalition (272+ Lok Sabha seats) to form the government. The PM and Council of Ministers are sworn in.',
      },
      {
        title: 'First Session & Oath',
        detail:
          'Newly elected members take the oath of office. A Speaker is elected. The government presents its agenda to Parliament.',
      },
    ],
  },
];

export default function ElectionTimeline() {
  return (
    <section aria-label="Election timeline">
      <h2 className="text-lg font-bold text-navy mb-6">
        Election Timeline — From Announcement to Government
      </h2>

      <ol className="relative list-none p-0" role="list">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>

        {STEPS.map((phase, pi) => (
          <li key={pi} className="mb-8" aria-label={`Phase ${pi + 1}: ${phase.phase}`}>
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={`w-8 h-8 rounded-full ${phase.color} flex items-center justify-center text-white text-xs font-bold`} aria-hidden="true">
                {pi + 1}
              </div>
              <h3 className="font-semibold text-gray-800">{phase.phase}</h3>
            </div>

            {/* Steps */}
            <div className="ml-12 space-y-3">
              {phase.steps.map((step, si) => (
                <details
                  key={si}
                  className="group bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:text-navy list-none flex items-center justify-between">
                    {step.title}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
                    {step.detail}
                  </p>
                </details>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
