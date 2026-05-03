/**
 * Election timeline steps for the 10 largest democracies.
 * Each country has phases with steps — same structure as before.
 */

const TIMELINES = {
  india: [
    {
      phase: 'Pre-Election',
      color: 'bg-orange-500',
      steps: [
        { title: 'Election Announcement', detail: 'The Election Commission announces the election schedule. The Model Code of Conduct comes into effect immediately.' },
        { title: 'Notification Issued', detail: 'The President (Lok Sabha) or Governor (State Assembly) issues a formal notification calling upon constituencies to elect members.' },
      ],
    },
    {
      phase: 'Nomination',
      color: 'bg-amber-500',
      steps: [
        { title: 'Filing of Nominations', detail: 'Candidates file nomination papers with the Returning Officer, including an affidavit of assets, criminal record, and educational qualifications. Security deposit: ₹25,000 (general) / ₹12,500 (SC/ST) for Lok Sabha.' },
        { title: 'Scrutiny', detail: 'The Returning Officer examines all nominations the day after filing closes. Invalid nominations are rejected.' },
        { title: 'Withdrawal', detail: 'Candidates may withdraw within 2 days after scrutiny. The final list of contesting candidates is then published.' },
      ],
    },
    {
      phase: 'Campaigning',
      color: 'bg-green-600',
      steps: [
        { title: 'Election Campaign', detail: 'Rallies, advertisements, door-to-door canvassing, and social media campaigns. Governed by the Model Code of Conduct. ECI monitors through flying squads and the cVIGIL app.' },
        { title: 'Silence Period', detail: 'All campaigning stops 48 hours before polling. No rallies, ads, or canvassing allowed.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-blue-600',
      steps: [
        { title: 'Polling Day(s)', detail: 'Voting at designated polling stations (7 AM – 6 PM). Multi-phase polling for large states. Voters use EVMs with VVPAT verification.' },
        { title: 'Sealing & Storage', detail: 'EVMs are sealed, transported to strong rooms under security escort, and guarded 24/7 until counting day.' },
      ],
    },
    {
      phase: 'Counting & Results',
      color: 'bg-purple-600',
      steps: [
        { title: 'Counting of Votes', detail: 'Postal ballots counted first, then EVM votes round by round. 5 random VVPAT machines per constituency are verified. Results updated live on results.eci.gov.in.' },
        { title: 'Results Declared', detail: 'The Returning Officer declares the winning candidate who receives a Certificate of Election.' },
      ],
    },
    {
      phase: 'Government Formation',
      color: 'bg-gray-800',
      steps: [
        { title: 'Invitation to Form Government', detail: 'The President invites the leader of the majority party/coalition (272+ Lok Sabha seats) to form the government.' },
        { title: 'First Session & Oath', detail: 'Newly elected members take the oath of office. A Speaker is elected. The government presents its agenda to Parliament.' },
      ],
    },
  ],

  usa: [
    {
      phase: 'Primaries & Caucuses',
      color: 'bg-blue-700',
      steps: [
        { title: 'Primary Elections', detail: 'Each state holds primary elections or caucuses (Jan–Jun of election year) where party members vote for their preferred presidential candidate.' },
        { title: 'Delegate Allocation', detail: 'Delegates are allocated based on primary/caucus results. Democrats use proportional allocation; Republicans vary by state.' },
      ],
    },
    {
      phase: 'National Conventions',
      color: 'bg-red-600',
      steps: [
        { title: 'Party Conventions', detail: 'Each major party holds a national convention (Jul–Aug) where delegates formally nominate their presidential candidate and adopt the party platform.' },
        { title: 'VP Selection', detail: 'The presidential nominee selects a running mate (Vice Presidential candidate), who is confirmed at the convention.' },
      ],
    },
    {
      phase: 'General Election Campaign',
      color: 'bg-indigo-600',
      steps: [
        { title: 'Campaign & Debates', detail: 'Candidates campaign nationwide. Presidential debates (usually 3) and one VP debate are held in Sep–Oct. Campaign finance regulated by the FEC.' },
        { title: 'Early & Absentee Voting', detail: 'Many states allow early voting (in-person or by mail) weeks before Election Day. Rules vary by state.' },
      ],
    },
    {
      phase: 'Election Day',
      color: 'bg-blue-500',
      steps: [
        { title: 'Voting', detail: 'Held on the first Tuesday after the first Monday in November. Voters cast ballots for president, Congress, and local offices. Methods: paper ballots, optical scan, DRE machines.' },
        { title: 'Ballot Counting', detail: 'Votes counted at precinct level. Results reported to county and state election boards. Major networks project winners based on exit polls and partial counts.' },
      ],
    },
    {
      phase: 'Electoral College',
      color: 'bg-purple-700',
      steps: [
        { title: 'Electors Vote', detail: 'In December, 538 electors vote based on their state\'s popular vote results. 270 electoral votes needed to win. Most states use winner-take-all.' },
        { title: 'Congressional Certification', detail: 'On January 6, Congress meets in joint session to count and certify electoral votes. The Vice President presides.' },
      ],
    },
    {
      phase: 'Inauguration',
      color: 'bg-gray-800',
      steps: [
        { title: 'Inauguration Day', detail: 'January 20 — the President-elect is sworn in at the U.S. Capitol, takes the oath of office, and delivers the inaugural address.' },
      ],
    },
  ],

  indonesia: [
    {
      phase: 'Pre-Election',
      color: 'bg-red-600',
      steps: [
        { title: 'KPU Announces Schedule', detail: 'The General Elections Commission (KPU) announces the election date and timeline. Indonesia holds simultaneous presidential, parliamentary, and regional elections.' },
        { title: 'Party & Candidate Registration', detail: 'Political parties register candidates. Presidential candidates must be nominated by parties holding 20% of DPR seats or 25% of popular vote.' },
      ],
    },
    {
      phase: 'Campaigning',
      color: 'bg-gray-100',
      steps: [
        { title: 'Campaign Period', detail: 'Official campaign period of 75 days. Campaigns include rallies, debates, and social media outreach. Bawaslu (Election Supervisory Board) monitors compliance.' },
        { title: 'Quiet Period', detail: '3-day quiet period before election day. No campaigning or political advertising allowed.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-red-500',
      steps: [
        { title: 'Election Day', detail: 'Single-day voting across 800,000+ polling stations. Paper ballots with nail-punch method. Voters elect president, DPR (parliament), DPD (senate), and regional councils.' },
        { title: 'Manual Counting', detail: 'Votes counted manually at polling stations with witnesses from each party. Results tallied publicly — a massive logistical operation.' },
      ],
    },
    {
      phase: 'Results & Disputes',
      color: 'bg-gray-700',
      steps: [
        { title: 'KPU Tabulation', detail: 'KPU tabulates national results within 35 days. Quick counts by independent pollsters available within hours.' },
        { title: 'Constitutional Court', detail: 'Disputes can be filed with the Constitutional Court (Mahkamah Konstitusi) within 3 days of official results.' },
      ],
    },
    {
      phase: 'Government Formation',
      color: 'bg-gray-800',
      steps: [
        { title: 'Inauguration', detail: 'The President and Vice President are inaugurated on October 20 at the MPR (People\'s Consultative Assembly). Cabinet is appointed shortly after.' },
      ],
    },
  ],

  brazil: [
    {
      phase: 'Pre-Election',
      color: 'bg-green-600',
      steps: [
        { title: 'TSE Schedule', detail: 'The Superior Electoral Court (TSE) sets the election calendar. Elections are held on the first Sunday of October.' },
        { title: 'Party Conventions', detail: 'Political parties hold conventions (Jun–Aug) to choose candidates. Coalition-building is a key strategy.' },
      ],
    },
    {
      phase: 'Campaign',
      color: 'bg-yellow-500',
      steps: [
        { title: 'Official Campaign', detail: '45-day official campaign period. Free TV/radio time allocated proportionally. Campaign financing capped and tracked by TSE.' },
        { title: 'Debates', detail: 'Mandatory TV debates between presidential candidates. Media coverage rules strictly enforced by the TSE.' },
      ],
    },
    {
      phase: 'Voting',
      color: 'bg-blue-700',
      steps: [
        { title: 'First Round', detail: 'Voting is mandatory for citizens 18–70. Electronic voting machines (urnas eletrônicas) used since 1996. Biometric voter verification in many states.' },
        { title: 'Runoff (If Needed)', detail: 'If no presidential candidate wins 50%+1, a runoff between the top two is held on the last Sunday of October.' },
      ],
    },
    {
      phase: 'Results & Transition',
      color: 'bg-green-700',
      steps: [
        { title: 'Results', detail: 'Results typically announced within hours thanks to electronic voting. TSE certifies final results.' },
        { title: 'Inauguration', detail: 'President takes office on January 1 in Brasília. New Congress members are also sworn in.' },
      ],
    },
  ],

  pakistan: [
    {
      phase: 'Pre-Election',
      color: 'bg-green-800',
      steps: [
        { title: 'ECP Announces Schedule', detail: 'The Election Commission of Pakistan (ECP) announces the election date. Must be held within 60 days of National Assembly dissolution.' },
        { title: 'Constituency Delimitation', detail: 'ECP reviews and updates constituency boundaries. Reserved seats allocated for women and minorities.' },
      ],
    },
    {
      phase: 'Nomination',
      color: 'bg-green-600',
      steps: [
        { title: 'Filing of Papers', detail: 'Candidates file nomination papers. Scrutiny of candidates includes asset declarations and verification of educational credentials.' },
        { title: 'Electoral Symbols', detail: 'ECP assigns electoral symbols to parties and independent candidates. Symbols are critical for voter identification.' },
      ],
    },
    {
      phase: 'Campaigning',
      color: 'bg-white',
      steps: [
        { title: 'Campaign Period', detail: 'Campaigns include rallies (jalsa), door-to-door canvassing, and media ads. Campaign spending limits monitored by ECP.' },
        { title: 'Code of Conduct', detail: 'ECP enforces a code of conduct. Military deployments assist with security at sensitive polling stations.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-green-500',
      steps: [
        { title: 'Election Day', detail: 'Voting on paper ballots with party symbols. Separate polling stations for men and women in many areas. CNIC (national ID) required.' },
        { title: 'Counting', detail: 'Manual counting at each polling station. Results transmitted to Returning Officers for consolidation.' },
      ],
    },
    {
      phase: 'Results & Government',
      color: 'bg-gray-800',
      steps: [
        { title: 'Results Declared', detail: 'ECP consolidates and announces final results. Elected members take oath. The President invites the majority leader to form government.' },
      ],
    },
  ],

  nigeria: [
    {
      phase: 'Pre-Election',
      color: 'bg-green-700',
      steps: [
        { title: 'INEC Timetable', detail: 'The Independent National Electoral Commission (INEC) releases the election timetable. Presidential elections held in February every 4 years.' },
        { title: 'Party Primaries', detail: 'Political parties conduct primaries to select candidates. Direct and indirect primary methods used.' },
      ],
    },
    {
      phase: 'Campaign',
      color: 'bg-green-500',
      steps: [
        { title: 'Campaign Period', detail: 'Official campaigns run 150 days before election. Rallies, media ads, and social media used extensively.' },
        { title: 'Voter Registration', detail: 'Continuous voter registration (CVR) by INEC. Permanent Voter Cards (PVCs) required for voting.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-green-600',
      steps: [
        { title: 'Election Day', detail: 'Bimodal Voter Accreditation System (BVAS) for biometric verification. Paper ballots used. Polling units open 8:30 AM – 2:30 PM.' },
        { title: 'INEC Results Upload', detail: 'Results uploaded electronically from polling units via IReV (INEC Result Viewing Portal) for transparency.' },
      ],
    },
    {
      phase: 'Results & Disputes',
      color: 'bg-gray-700',
      steps: [
        { title: 'Collation & Declaration', detail: 'Results collated at ward, LGA, state, and national levels. Presidential winner must get 25% in 2/3 of 36 states + FCT.' },
        { title: 'Election Tribunal', detail: 'Disputes filed at Election Petition Tribunal within 21 days. Appeals go to the Supreme Court.' },
      ],
    },
    {
      phase: 'Inauguration',
      color: 'bg-gray-800',
      steps: [
        { title: 'Swearing In', detail: 'The President is inaugurated on May 29. New National Assembly members are also sworn in.' },
      ],
    },
  ],

  bangladesh: [
    {
      phase: 'Pre-Election',
      color: 'bg-green-700',
      steps: [
        { title: 'EC Announces Schedule', detail: 'The Bangladesh Election Commission announces the election date. National elections held every 5 years under a caretaker/interim arrangement.' },
        { title: 'Candidate Nomination', detail: 'Candidates file nomination papers with the Returning Officer. Security deposit of BDT 10,000 required.' },
      ],
    },
    {
      phase: 'Campaigning',
      color: 'bg-red-500',
      steps: [
        { title: 'Campaign Period', detail: 'Parties campaign through rallies, processions, posters, and media. Campaign spending monitored by the EC.' },
        { title: 'Code of Conduct', detail: 'EC enforces election code of conduct. Security forces deployed to maintain order.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-green-600',
      steps: [
        { title: 'Election Day', detail: 'Voting on paper ballots using party symbols. National voter ID required. Polling from 8 AM to 4 PM.' },
        { title: 'Counting', detail: 'Manual counting at polling centres. Results reported to EC for national tabulation.' },
      ],
    },
    {
      phase: 'Results & Government',
      color: 'bg-gray-800',
      steps: [
        { title: 'Results & Government Formation', detail: 'EC announces results. The party/coalition with majority in Jatiya Sangsad (Parliament, 300 seats) forms government. PM sworn in by the President.' },
      ],
    },
  ],

  japan: [
    {
      phase: 'Dissolution & Announcement',
      color: 'bg-red-600',
      steps: [
        { title: 'Dissolution of House', detail: 'The Prime Minister advises the Emperor to dissolve the House of Representatives. Election must be held within 40 days of dissolution.' },
        { title: 'Official Announcement', detail: 'The Ministry of Internal Affairs announces the election date. Campaign period officially begins 12 days before the election.' },
      ],
    },
    {
      phase: 'Campaign',
      color: 'bg-gray-200',
      steps: [
        { title: 'Official Campaign', detail: 'Strict 12-day campaign period. Sound trucks, posters on designated boards, NHK broadcasts, and limited internet campaigning allowed since 2013.' },
        { title: 'Debates', detail: 'Party leader debates broadcast on NHK and private channels. Each party gets equal time for political broadcasts.' },
      ],
    },
    {
      phase: 'Polling',
      color: 'bg-red-500',
      steps: [
        { title: 'Election Day', detail: 'Usually held on a Sunday. Voters cast two ballots: one for a constituency candidate (FPTP) and one for a party (proportional representation). Mixed-member system.' },
        { title: 'Early Voting', detail: 'Early voting available at designated centres for those unable to vote on election day.' },
      ],
    },
    {
      phase: 'Counting & Results',
      color: 'bg-gray-700',
      steps: [
        { title: 'Vote Counting', detail: 'Ballots counted at municipal election offices. Results typically available by late evening.' },
        { title: 'Proportional Seats', detail: 'PR seats allocated using the D\'Hondt method across 11 regional blocs. Total: 465 seats (289 constituency + 176 PR).' },
      ],
    },
    {
      phase: 'Government Formation',
      color: 'bg-gray-800',
      steps: [
        { title: 'PM Election by Diet', detail: 'The new Diet convenes within 30 days. The House of Representatives elects the Prime Minister, who is appointed by the Emperor.' },
      ],
    },
  ],

  mexico: [
    {
      phase: 'Pre-Election',
      color: 'bg-green-700',
      steps: [
        { title: 'INE Announces Process', detail: 'The National Electoral Institute (INE) announces the electoral calendar. Federal elections held on the first Sunday of June every 6 years (president) and 3 years (Congress).' },
        { title: 'Party Registration', detail: 'Parties and coalitions register candidates with INE. Independent candidates can run after collecting sufficient citizen signatures.' },
      ],
    },
    {
      phase: 'Campaign',
      color: 'bg-white',
      steps: [
        { title: 'Precampaign & Campaign', detail: 'Pre-campaign (intercampaña) for party primaries, then a 90-day official campaign. INE monitors spending and media time distribution.' },
        { title: 'Debates', detail: 'INE organizes mandatory presidential debates. Additional debates at state level for gubernatorial races.' },
      ],
    },
    {
      phase: 'Voting',
      color: 'bg-red-600',
      steps: [
        { title: 'Election Day', detail: 'Voting with paper ballots, hand-counted. INE-issued voter credential (credencial para votar) required. Polls open 8 AM – 6 PM.' },
        { title: 'PREP Quick Count', detail: 'INE runs the Preliminary Electoral Results Program (PREP) — a rapid count system providing early results on election night.' },
      ],
    },
    {
      phase: 'Results & Certification',
      color: 'bg-green-600',
      steps: [
        { title: 'Official Count', detail: 'INE district councils conduct the official count in the days following the election. Results published publicly.' },
        { title: 'TEPJF Certification', detail: 'The Electoral Tribunal (TEPJF) resolves challenges and certifies the president-elect by September.' },
      ],
    },
    {
      phase: 'Inauguration',
      color: 'bg-gray-800',
      steps: [
        { title: 'Taking Office', detail: 'The President is inaugurated on October 1 (changed from December 1 as of 2024). New Congress members take office September 1.' },
      ],
    },
  ],

  philippines: [
    {
      phase: 'Pre-Election',
      color: 'bg-blue-700',
      steps: [
        { title: 'COMELEC Calendar', detail: 'The Commission on Elections (COMELEC) sets the election calendar. National and local elections held on the second Monday of May every 3/6 years.' },
        { title: 'Filing of Candidacy', detail: 'Certificate of Candidacy (COC) filed with COMELEC during filing period (usually October of prior year). Nuisance candidates may be disqualified.' },
      ],
    },
    {
      phase: 'Campaign',
      color: 'bg-red-600',
      steps: [
        { title: 'Campaign Period', detail: 'National campaign: 90 days. Local campaign: 45 days. Rallies, motorcades, and massive social media campaigns are common.' },
        { title: 'Gun Ban', detail: 'COMELEC implements an election gun ban period. Checkpoints set up nationwide by PNP and military.' },
      ],
    },
    {
      phase: 'Voting',
      color: 'bg-yellow-500',
      steps: [
        { title: 'Election Day', detail: 'Automated Election System (AES) using Vote Counting Machines (VCMs) and paper ballots. Polls open 6 AM – 7 PM. Voters use biometric or valid ID.' },
        { title: 'Transmission', detail: 'Results electronically transmitted from VCMs to COMELEC transparency server and canvassing centres.' },
      ],
    },
    {
      phase: 'Canvassing & Proclamation',
      color: 'bg-blue-600',
      steps: [
        { title: 'Canvassing', detail: 'Congress (for president/VP) and COMELEC (for senators) canvass votes. Board of Canvassers proclaim local winners.' },
        { title: 'Proclamation', detail: 'The winning president and VP are proclaimed by Congress. Senate and House winners proclaimed by COMELEC.' },
      ],
    },
    {
      phase: 'Inauguration',
      color: 'bg-gray-800',
      steps: [
        { title: 'Inauguration Day', detail: 'June 30 — the President takes the oath of office at noon. The new government officially begins its 6-year term.' },
      ],
    },
  ],
};

export default TIMELINES;
