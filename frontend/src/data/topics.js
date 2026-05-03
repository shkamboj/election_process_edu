/**
 * Topic cards for the 10 largest democracies.
 */

const TOPICS_BY_COUNTRY = {
  india: [
    { emoji: '🏛️', title: 'Indian Democracy Basics', summary: 'Parliamentary system, Constitution (Part XV, Articles 324–329), universal adult suffrage, Lok Sabha & Rajya Sabha.' },
    { emoji: '⚖️', title: 'Election Commission of India', summary: 'Autonomous constitutional body — CEC, election commissioners, SVEEP, cVIGIL, and Voter Helpline 1950.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'Lok Sabha, Rajya Sabha, State Assembly, Local Body, Presidential, By-Elections — FPTP & STV systems.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Eligibility (18+), Form 6 on NVSP portal, EPIC/Voter ID, e-EPIC, NRI voting, and the Voter Helpline app.' },
    { emoji: '📅', title: 'Election Timeline', summary: 'Announcement → Nomination → Scrutiny → Withdrawal → Campaigning → Silence Period → Polling → Counting → Government Formation.' },
    { emoji: '🖲️', title: 'EVM & VVPAT', summary: 'How Electronic Voting Machines work, M3 EVMs, VVPAT paper trail, ballot unit & control unit, security features.' },
    { emoji: '🗓️', title: 'Voting Process', summary: 'Step-by-step polling day guide — ID check, indelible ink, casting vote on EVM, VVPAT verification, postal ballots.' },
    { emoji: '📜', title: 'Model Code of Conduct', summary: 'Rules for parties and government during elections — campaign restrictions, monitoring, enforcement, cVIGIL app.' },
    { emoji: '🏆', title: 'Post-Election Process', summary: 'Counting procedure, election petitions, recounts, government formation, coalition politics, transition of power.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'RPA 1950 & 1951, Anti-Defection Law (10th Schedule), Delimitation Act, Constitutional Amendments on elections.' },
  ],

  usa: [
    { emoji: '🏛️', title: 'Constitutional Framework', summary: 'Article II (Executive), 12th Amendment (Electoral College), 15th/19th/26th Amendments (voting rights expansion).' },
    { emoji: '🗳️', title: 'Electoral College', summary: '538 electors, 270 to win. Winner-take-all in 48 states. Maine and Nebraska use congressional district method.' },
    { emoji: '🏗️', title: 'Federal vs State Elections', summary: 'Federal (President, Congress), State (Governor, Legislature), Local (Mayor, School Board). Decentralized administration.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'State-by-state rules. Motor Voter Act, online registration, same-day registration in some states. Voter ID laws vary.' },
    { emoji: '🗓️', title: 'Primary System', summary: 'Open vs closed primaries, caucuses, Super Tuesday, delegate allocation, contested conventions.' },
    { emoji: '💰', title: 'Campaign Finance', summary: 'FEC regulation, PACs, Super PACs, Citizens United ruling, individual contribution limits, public financing.' },
    { emoji: '📊', title: 'Voting Methods', summary: 'Paper ballots, optical scan, DRE machines, mail-in voting, early voting, provisional ballots.' },
    { emoji: '⚖️', title: 'Voting Rights', summary: 'Voting Rights Act of 1965, gerrymandering, voter suppression concerns, felony disenfranchisement.' },
    { emoji: '🏆', title: 'Post-Election Process', summary: 'Electoral vote certification, January 6 joint session, presidential transition, inauguration.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Help America Vote Act, National Voter Registration Act, Electoral Count Reform Act.' },
  ],

  indonesia: [
    { emoji: '🏛️', title: 'Pancasila Democracy', summary: 'Unitary republic, presidential system, Pancasila ideology, 1945 Constitution (UUD 1945), Reformasi era changes.' },
    { emoji: '⚖️', title: 'KPU & Bawaslu', summary: 'General Elections Commission (KPU) administers elections. Bawaslu supervises. Both are independent bodies.' },
    { emoji: '🗳️', title: 'Simultaneous Elections', summary: 'Since 2019: President, DPR (parliament), DPD (senate), provincial & district legislatures — all on one day.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Automatic registration from civil registry. KPU updates voter list (DPT). KTP (national ID) used for verification.' },
    { emoji: '📅', title: 'Election Timeline', summary: 'Schedule set by KPU → party registration → campaigns → quiet period → voting → counting → Constitutional Court disputes.' },
    { emoji: '📝', title: 'Paper Ballot System', summary: 'Paper ballots with nail-punch method. Manual counting at polling stations. Massive logistics across 17,000+ islands.' },
    { emoji: '🗓️', title: 'Campaign Rules', summary: '75-day campaign period. Bawaslu monitors compliance. Social media regulation for political ads.' },
    { emoji: '📜', title: 'Electoral Thresholds', summary: '4% parliamentary threshold. Presidential candidates need 20% DPR seats or 25% popular vote for nomination.' },
    { emoji: '🏆', title: 'Results & Disputes', summary: 'KPU tabulates within 35 days. Disputes go to Constitutional Court (MK). Quick counts by independent pollsters.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Law No. 7/2017 on Elections, Constitutional Court rulings on simultaneous elections and thresholds.' },
  ],

  brazil: [
    { emoji: '🏛️', title: 'Federal Republic', summary: 'Presidential system, 1988 Constitution, 26 states + Federal District, mandatory voting for 18–70.' },
    { emoji: '⚖️', title: 'TSE & TREs', summary: 'Superior Electoral Court (TSE) oversees national elections. Regional Electoral Courts (TREs) handle state-level.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'Federal (President, Congress), State (Governor, Assembly), Municipal (Mayor, Council). Two-round system for executives.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Mandatory enrollment at 18. Title de eleitor (voter card). Biometric registration expanding nationwide.' },
    { emoji: '🖲️', title: 'Electronic Voting', summary: 'Urna eletrônica since 1996. Fully electronic, no paper trail controversy. TSE conducts public security audits.' },
    { emoji: '📅', title: 'Election Calendar', summary: 'First Sunday of October (first round), last Sunday (runoff if needed). Municipal elections in even non-presidential years.' },
    { emoji: '💰', title: 'Campaign Finance', summary: 'Public fund (Fundo Eleitoral), corporate donations banned since 2015. TSE monitors spending in real time.' },
    { emoji: '📊', title: 'Party System', summary: '30+ registered parties. Coalition-building essential. Federations and party switching rules (fidelidade partidária).' },
    { emoji: '🏆', title: 'Post-Election', summary: 'TSE certifies results. Transition period. President inaugurated January 1 in Brasília.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Electoral Code, Lei das Eleições (Law 9.504/97), Clean Record Law (Ficha Limpa), Mini Electoral Reform.' },
  ],

  pakistan: [
    { emoji: '🏛️', title: 'Parliamentary Democracy', summary: 'Federal parliamentary republic, 1973 Constitution, bicameral parliament (National Assembly + Senate).' },
    { emoji: '⚖️', title: 'Election Commission of Pakistan', summary: 'Constitutional body led by the Chief Election Commissioner. Conducts delimitation, voter rolls, election management.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'National Assembly (272 general + 60 women + 10 minorities), Provincial Assemblies, Senate (indirect), Local Bodies.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'CNIC-based voter registration. ECP maintains electoral rolls. NADRA assists with biometric verification.' },
    { emoji: '📅', title: 'Election Timeline', summary: 'Dissolution → 60-day window → ECP schedule → nominations → scrutiny → campaign → polling → results → government formation.' },
    { emoji: '📝', title: 'Ballot & Symbol System', summary: 'Paper ballots with party symbols. Symbols assigned by ECP. Critical for voter identification in semi-literate areas.' },
    { emoji: '🛡️', title: 'Security Arrangements', summary: 'Military and paramilitary deployed at sensitive stations. Rangers assist in urban areas. CCTV monitoring expanding.' },
    { emoji: '📜', title: 'Code of Conduct', summary: 'ECP enforces election code. Restrictions on government resources use. Media monitoring for fair coverage.' },
    { emoji: '🏆', title: 'Post-Election', summary: 'Returning Officers declare winners. Election Tribunals handle disputes. PM elected by National Assembly majority.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Elections Act 2017, Political Parties Order 2002, Senate Elections Act, 25th Amendment (FATA merger).' },
  ],

  nigeria: [
    { emoji: '🏛️', title: 'Federal Republic', summary: 'Presidential system, 1999 Constitution (4th Republic), 36 states + FCT, federal character principle.' },
    { emoji: '⚖️', title: 'INEC', summary: 'Independent National Electoral Commission. Administers federal, state, and area council elections across Nigeria.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'Presidential, National Assembly (Senate + House), Gubernatorial, State Assembly, Local Government.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Continuous Voter Registration (CVR). Permanent Voter Card (PVC) with biometrics required. Online pre-registration available.' },
    { emoji: '📅', title: 'Election Timeline', summary: 'INEC timetable → party primaries → campaigns → election day → collation → results → tribunals → inauguration.' },
    { emoji: '🖲️', title: 'BVAS Technology', summary: 'Bimodal Voter Accreditation System for fingerprint/facial verification. IReV portal for real-time result uploads.' },
    { emoji: '🗓️', title: 'Staggered Elections', summary: 'Presidential and National Assembly held 2 weeks before Gubernatorial and State Assembly elections.' },
    { emoji: '📜', title: '25% Rule', summary: 'Presidential winner must get 25% of votes in at least 2/3 of 36 states + FCT. Unique geographic spread requirement.' },
    { emoji: '🏆', title: 'Election Disputes', summary: 'Election Petition Tribunal (21-day filing window). Appeals to Court of Appeal, then Supreme Court (final).' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Electoral Act 2022, 1999 Constitution, INEC regulations, Political Parties Finance Act.' },
  ],

  bangladesh: [
    { emoji: '🏛️', title: 'Parliamentary Democracy', summary: 'Unitary parliamentary republic, 1972 Constitution, Jatiya Sangsad (300 directly elected + 50 reserved women seats).' },
    { emoji: '⚖️', title: 'Election Commission', summary: 'Constitutional body headed by Chief Election Commissioner. Manages voter rolls, polling logistics, and election disputes.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'National Parliament (Jatiya Sangsad), Local Government (Union Parishad, Upazila, City Corporation, Municipality).' },
    { emoji: '📋', title: 'Voter Registration', summary: 'National voter ID card with photo. EC maintains digital voter database. Registration drives before elections.' },
    { emoji: '📅', title: 'Election Process', summary: 'Parliament dissolved → Interim/Caretaker arrangement → EC schedule → nominations → campaigns → polling → results.' },
    { emoji: '📝', title: 'Ballot System', summary: 'Paper ballots with party symbols. Stamp-based marking. Manual counting at polling centres.' },
    { emoji: '🛡️', title: 'Security & Oversight', summary: 'Military and RAB deployment at sensitive centres. National and international observers monitor the process.' },
    { emoji: '📜', title: 'Caretaker System', summary: 'Historically, a non-partisan caretaker government oversaw elections (1996–2011). Now a contentious political issue.' },
    { emoji: '🏆', title: 'Government Formation', summary: 'Party with majority forms government. PM appointed by President from among parliament members.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Representation of the People Order 1972, Election Commission Rules, Local Government Acts.' },
  ],

  japan: [
    { emoji: '🏛️', title: 'Constitutional Monarchy', summary: 'Parliamentary system, 1947 Constitution (Article 9), Emperor as ceremonial head, bicameral National Diet.' },
    { emoji: '⚖️', title: 'Election Administration', summary: 'Ministry of Internal Affairs oversees. Prefectural and municipal election commissions manage polling. Strict neutrality rules.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'House of Representatives (465 seats, mixed-member), House of Councillors (248 seats), Prefectural/Municipal.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Automatic registration from resident registry at age 18. Postcard notification sent before election. No voter ID required at polls.' },
    { emoji: '📅', title: 'Election Timeline', summary: 'Dissolution (HoR) → 40-day window → 12-day campaign → election day (Sunday) → counting → PM election by Diet.' },
    { emoji: '📝', title: 'Mixed-Member System', summary: '289 single-member constituencies (FPTP) + 176 proportional seats (11 regional blocs, D\'Hondt method).' },
    { emoji: '📢', title: 'Campaign Rules', summary: 'Strict 12-day limit. Sound trucks, designated poster boards, NHK broadcasts. Door-to-door canvassing prohibited.' },
    { emoji: '💰', title: 'Political Funding', summary: 'Public subsidies to parties. Political Fund Control Law. Recent scandals prompted reform discussions.' },
    { emoji: '🏆', title: 'Government Formation', summary: 'Diet elects PM from among its members. Coalition governments common. Cabinet appointed by PM.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Public Offices Election Act, Political Funds Control Act, National Referendum Act.' },
  ],

  mexico: [
    { emoji: '🏛️', title: 'Federal Republic', summary: 'Presidential system, 1917 Constitution, 31 states + Mexico City, separation of powers.' },
    { emoji: '⚖️', title: 'INE', summary: 'National Electoral Institute (INE) — autonomous body administering federal elections. Local institutes (OPLE) for state elections.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'Federal: President (6-year, no re-election), Senate (128), Chamber of Deputies (500). State/Municipal elections.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'INE voter credential (credencial para votar) serves as primary national ID. Automatic enrollment at 18.' },
    { emoji: '📅', title: 'Election Calendar', summary: 'First Sunday of June. Presidential every 6 years. Congress every 3 years. Concurrent state elections increasingly common.' },
    { emoji: '📝', title: 'Paper Ballot System', summary: 'Paper ballots hand-counted at each polling station (casilla). Citizens randomly selected as poll workers (funcionarios de casilla).' },
    { emoji: '📊', title: 'PREP & Quick Count', summary: 'INE\'s Preliminary Results Program (PREP) provides rapid unofficial results. Statistical quick count for early projections.' },
    { emoji: '💰', title: 'Campaign Finance', summary: 'Public financing dominant. Strict spending limits. INE monitors media time allocation. Corporate donations banned.' },
    { emoji: '🏆', title: 'TEPJF & Disputes', summary: 'Electoral Tribunal (TEPJF) resolves challenges. Can annul elections. Final authority on presidential election validity.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'LGIPE (General Law of Electoral Institutions), LGPP (Law of Political Parties), 2014 Electoral Reform.' },
  ],

  philippines: [
    { emoji: '🏛️', title: 'Presidential Republic', summary: '1987 Constitution, presidential system, bicameral Congress (Senate + House), unitary government with autonomous regions.' },
    { emoji: '⚖️', title: 'COMELEC', summary: 'Commission on Elections — constitutional body administering all elections. Enforces election laws and resolves disputes.' },
    { emoji: '🗳️', title: 'Types of Elections', summary: 'National: President, VP, Senators (12), House (district + party-list). Local: Governor, Mayor, Council every 3 years.' },
    { emoji: '📋', title: 'Voter Registration', summary: 'Biometric voter registration. Voters\' ID optional. National ID now accepted. Registration periods set by COMELEC.' },
    { emoji: '📅', title: 'Election Calendar', summary: 'Second Monday of May. Synchronized national and local elections every 3 years (presidential every 6).' },
    { emoji: '🖲️', title: 'Automated Election System', summary: 'Vote Counting Machines (VCMs) with paper ballot backup. Electronic transmission to canvassing centres.' },
    { emoji: '📢', title: 'Campaign Rules', summary: '90-day national campaign, 45-day local. Spending limits. COMELEC regulates political ads and social media.' },
    { emoji: '🔫', title: 'Gun Ban Period', summary: 'COMELEC implements election gun ban 6 months before and after elections. Checkpoints nationwide.' },
    { emoji: '🏆', title: 'Canvassing & Proclamation', summary: 'Congress canvasses president/VP. COMELEC for senators. Provincial/City boards for local positions.' },
    { emoji: '📖', title: 'Key Legislation', summary: 'Omnibus Election Code, Republic Act 9369 (Automation), Party-List System Act, Fair Elections Act.' },
  ],
};

export default TOPICS_BY_COUNTRY;
