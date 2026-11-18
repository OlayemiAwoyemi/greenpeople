/**
 * Election Matters — full score breakdowns for each episode.
 * Scores are Green People's editorial weighting of public records.
 * Allegations are never treated as convictions; each person's side is stated.
 * As of 18 November 2026.
 */

export type Source = { label: string; url: string };
export type Beat = {
  points: number;
  title: string;
  why: string;
  theirSide?: string;
  sources: Source[];
};
export type Person = {
  slug: string;
  name: string;
  meta: string; // party or years in office
  final: number;
  verdict: string;
  beats: Beat[];
  note?: string;
};
export type Episode = {
  id: "2027" | "1960";
  number: string;
  title: string;
  strap: string;
  sharePath: string;
  intro: string;
  rules: { label: string; points: string; why: string }[];
  people: Person[];
  takeaways: string[];
};

const SHARED_RULES = [
  { label: "A good record that changed lives", points: "+1 to +8", why: "Scaled by how many Nigerians it reached and whether it lasted." },
  { label: "Harm on their watch", points: "−1 to −6", why: "Poverty, insecurity or rights abuses, scaled by reach and by whether they acted." },
  { label: "A broken promise, or one with no workable plan", points: "−1 to −7", why: "Weighted heavily: a promise is a contract with voters." },
  { label: "A public integrity question", points: "−1 to −7", why: "A report, leak or court case. Counted as an open question, never as guilt. Their denial is always stated." },
];

export const EPISODE_2027: Episode = {
  id: "2027",
  number: "01",
  title: "The 2027 candidates",
  strap: "Four people want the keys to Nigeria. We scored all of them. Nobody finished above zero.",
  sharePath: "/em/2027",
  intro:
    "Every candidate starts at zero. We count their whole career: what they did in office, what they promise now, open integrity questions, and their ticket. The final score is the total.",
  rules: [
    ...SHARED_RULES,
    { label: "The ticket", points: "−2 to +1", why: "The running mate is scored, and so is a realistic chance to win (front-runner +1). Combined into one final beat." },
  ],
  people: [
    {
      slug: "obi",
      name: "Peter Obi",
      meta: "NDC · Nigeria Democratic Congress",
      final: -3.5,
      verdict: "Highest score, but still below zero",
      beats: [
        {
          points: 4,
          title: "Anambra's exam results rose from 26th to 1st, and he left savings",
          why: "Anambra came first in Nigeria in the 2013 WASSCE while he was governor. He also left cash and dollar savings for his successor. Lasting and widely felt, so a strong plus.",
          theirSide: "WAEC says it does not officially rank states, and the exact '26th' starting point comes from Obi's own account.",
          sources: [
            { label: "Anambra first in 2013 WASSCE (Punch, via MySchoolGist)", url: "https://myschoolgist.com/ng/anambra-overall-best-in-2013-wassce" },
            { label: "Anambra first in 2013 NECO entrance (News Express)", url: "https://newsexpressngr.com/news/5370/anambra-scores-another-first-in-neco-examination" },
          ],
        },
        {
          points: 3,
          title: "A plan for every region and for security",
          why: "His 2027 programme sets out production-led plans by region and a security agenda. Specific enough to judge, so a plus.",
          sources: [
            { label: "Obi accepts NDC ticket and sets out his plan (Premium Times)", url: "https://www.premiumtimesng.com/news/top-news/884192-peter-obi-reels-out-a-plan-for-nigeria-says-kwankwaso-wont-be-a-spare-tyre.html" },
          ],
        },
        {
          points: -5,
          title: "₦500 to $1, with no plan for how",
          why: "His camp says he will take the naira from about ₦1,350 to ₦500 per dollar. No route to that was published, and Obi has also said he will keep the floating rate. An unworkable promise counts heavily.",
          theirSide: "The ₦500 target was announced by NDC chieftain Pat Utomi on Obi's behalf. Supporters argue the naira is undervalued.",
          sources: [
            { label: "Utomi: Obi will strengthen naira to ₦500/$1 (ThisDay)", url: "https://www.thisdaylive.com/2026/10/31/utomi-obi-will-strengthen-naira-to-n500-1-if-elected-president/" },
            { label: "₦500 to the dollar: aspiration and arithmetic (Nairametrics)", url: "https://nairametrics.com/2026/11/03/n500-to-the-dollar-aspiration-arithmetic-and-economic-reality/" },
            { label: "Obi says he will retain the naira float (Premium Times)", url: "https://premiumtimesng.com/news/top-news/908623-2027-peter-obi-names-tinubus-policy-hell-retain-if-elected.html" },
          ],
        },
        {
          points: -5,
          title: "Pandora Papers, and the 'no debt' claim",
          why: "The 2021 Pandora Papers reported offshore companies he did not declare while governor. Separately, fact-checkers found his claim that he left Anambra with no debt false or misleading: records show external loans when he left.",
          theirSide: "Obi says he broke no law and that the offshore firm held family assets. He insists he left no unpaid debt.",
          sources: [
            { label: "Pandora Papers: Obi's offshore businesses (ICIR / Premium Times)", url: "https://www.icirnigeria.org/pandora-papers-inside-peter-obis-secret-businesses-and-how-he-broke-the-law/" },
            { label: "Pandora Papers: Obi denies wrongdoing (QED)", url: "https://qed.ng/?p=212979" },
            { label: "Fact check: Obi 'left no debt' claim (Guardian)", url: "https://guardian.ng/?p=2614112" },
            { label: "Fact check: did Obi owe $123.77m? (Daily Trust)", url: "https://dailytrust.com/?p=1957633" },
          ],
        },
        {
          points: -0.5,
          title: "Running mate and chance to win",
          why: "Running mate Rabiu Kwankwaso carries his own record (−1.5). Obi is one of the front-runners (+1). Net −0.5.",
          sources: [
            { label: "Obi picks Kwankwaso as running mate (Channels TV)", url: "https://www.channelstv.com/2026/05/30/ndc-unveils-obi-as-presidential-candidate-for-2027-general-elections/" },
            { label: "SBM voter sentiment tracker", url: "https://sbmintelligence.substack.com/p/the-sbm-voter-sentiment-tracker-how" },
          ],
        },
      ],
    },
    {
      slug: "tinubu",
      name: "Bola Tinubu",
      meta: "APC · All Progressives Congress",
      final: -4,
      verdict: "Half a point behind Obi",
      beats: [
        {
          points: 8,
          title: "Inflation down to 14%, reserves up, minimum wage more than doubled",
          why: "Headline inflation fell from 18.97% (October 2025) to 14.06% (October 2026). Reserves rose from about $33bn at the end of 2023 to over $50bn. The minimum wage went from ₦30,000 to ₦70,000. Nationwide and measurable, so the biggest plus in the episode.",
          sources: [
            { label: "Inflation eases to 14.06% in October 2026 (Guardian)", url: "https://guardian.ng/news/inflation-eases-to-14-06-second-consecutive-month-of-decline/" },
            { label: "Reserves rise to $50.45bn (Nairametrics)", url: "https://nairametrics.com/2026/02/24/nigerias-fx-reserves-hit-50-45-billion-highest-in-13-years-cardoso/" },
            { label: "Reserves from $33.22bn at end-2023 (African Business)", url: "https://african.business/2026/03/quick-reads/nigerias-external-reserves-building-buffers-and-resilience" },
            { label: "₦70,000 minimum wage signed (Order Paper)", url: "https://orderpaper.ng/?p=22260" },
          ],
        },
        {
          points: -6,
          title: "Poverty at 63%, kidnappings up 66%",
          why: "The World Bank estimates 63% of Nigerians lived below the poverty line in 2025, about 140 million people. SBM Intelligence counted 7,825 people kidnapped from July 2025 to June 2026, up 66% on the year before.",
          sources: [
            { label: "World Bank: poverty rises to 63% (AllAfrica)", url: "https://allafrica.com/stories/202604100079.html" },
            { label: "SBM: kidnappings up 66% (Nairametrics)", url: "https://nairametrics.com/2026/08/27/nigerians-pay-n7-78-billion-ransom-as-kidnappings-surge-66/" },
          ],
        },
        {
          points: -1,
          title: "A strong Lagos record, but old promises recycled",
          why: "His Lagos years still earn credit. But the 2027 manifesto promises to halve youth unemployment by 2031 without a clear plan, repeating 2023 pledges.",
          sources: [
            { label: "Tinubu's 2027–2031 manifesto (Arise)", url: "https://www.arise.tv/what-tinubus-2027-2031-manifesto-promises-on-jobs-housing-security-and-the-economy/" },
            { label: "Tinubu repackages 2023 promises (Daily Trust)", url: "https://dailytrust.com/?p=1975266" },
          ],
        },
        {
          points: -6,
          title: "1993 US forfeiture, and one false claim",
          why: "In 1993 he forfeited $460,000 in US bank accounts linked by investigators to heroin proceeds. Africa Check rated incorrect his 2026 Independence Day claim that salaries and pensions have been paid on time and in full since 2023.",
          theirSide: "Tinubu was never charged. He says the US case was a civil matter against bank accounts, not against him.",
          sources: [
            { label: "Timeline of the 1993 case (BusinessDay)", url: "https://businessday.ng/news/article/timeline-of-how-tinubus-buried-drug-case-resurfaced/" },
            { label: "Tinubu's position: civil case against accounts (BusinessDay)", url: "https://businessday.ng/?p=724452" },
            { label: "Africa Check: 2026 Independence Day claims (Polity)", url: "https://www.polity.org.za/article/fact-checking-2026-independence-day-claims-by-nigerian-president-bola-tinubu-2026-10-07" },
          ],
        },
        {
          points: 1,
          title: "Chance to win",
          why: "Most polls and forecasts place him as the front-runner.",
          sources: [
            { label: "Oxford–Metro poll: Tinubu leads (Legit)", url: "https://www.legit.ng/politics/1730449-tinubu-atiku-obi-oxford-metro-poll-predicts-potential-winner-2027-election/" },
            { label: "Early forecast: Tinubu 20 states (Guardian)", url: "https://guardian.ng/?p=2909071" },
          ],
        },
      ],
    },
    {
      slug: "makinde",
      name: "Seyi Makinde",
      meta: "APM · Allied Peoples Movement",
      final: -7,
      verdict: "Good on paper at home, but heavy minuses",
      beats: [
        {
          points: 6,
          title: "Debt cut, Amotekun and a state-police plan",
          why: "Oyo's external debt fell 36% and domestic debt 22% between 2019 and 2025. He signed the Amotekun security law in 2020, and his Reset Agenda sets out a detailed state-police plan.",
          sources: [
            { label: "Oyo cut external debt 36%, domestic 22% (Intelpoint)", url: "https://intelpoint.co/insights/oyo-has-reduced-external-debt-by-36-and-domestic-debt-by-22-under-makinde/" },
            { label: "Makinde signs Amotekun law (Channels TV)", url: "https://www.channelstv.com/2020/03/10/makinde-signs-amotekun-bill-reads-riot-act-to-kidnappers/" },
            { label: "Dissecting the Reset Agenda (Guardian)", url: "https://guardian.ng/?p=2955225" },
          ],
        },
        {
          points: -5,
          title: "Debt service up fourfold, weak transparency",
          why: "BudgIT reports Oyo's debt-servicing bill rose from ₦45.02bn to ₦182.96bn in a year, up 306%. Reporting on borrowing has also been criticised as opaque.",
          sources: [
            { label: "BudgIT State of States 2026 (Leadership)", url: "https://leadership.ng/35-states-spend-n1-99trn-on-debt-servicing-as-pension-contractor-arrears-mount/" },
            { label: "Oyo borrowed ₦164.8bn in Q1 2026 (SaharaReporters)", url: "https://saharareporters.com/2026/05/01/oyo-government-under-makinde-three-months-borrows-n1648billion-which-six-times-its" },
          ],
        },
        {
          points: -6,
          title: "The Oriire school abductions, and 'reset Nigeria in four years'",
          why: "On 15 May 2026, gunmen took 39 pupils and 7 teachers from three schools in Oriire, Oyo State. He also promises to 'reset' the whole country in one four-year term, which no plan supports.",
          theirSide: "Makinde visited the community, reported arrests of six suspects and says all resources were deployed.",
          sources: [
            { label: "39 pupils and 7 teachers abducted (The Tablet)", url: "https://www.thetablet.co.uk/news/abductions-from-baptist-school-a-national-disgrace-say-nigerian-christians/" },
            { label: "Makinde visits Oriire (Peoples Gazette)", url: "https://gazettengr.com/school-abduction-makinde-visits-oriire-reassures-families-of-rescue-efforts/" },
            { label: "'I will reset Nigeria in four years' (Daily Trust)", url: "https://dailytrust.com/?p=1958220" },
          ],
        },
        {
          points: -2,
          title: "Running mate: Lawal Daura",
          why: "Daura was sacked as DSS chief in August 2018 after his officers blockaded the National Assembly. That weighs on the ticket.",
          sources: [
            { label: "Makinde picks Daura (Premium Times)", url: "https://www.premiumtimesng.com/news/top-news/902925-four-days-after-exiting-adc-ex-chief-of-sss-lawal-daura-picks-apms-vp-slot.html" },
            { label: "Osinbajo sacks Daura over NASS siege (Channels TV)", url: "https://www.channelstv.com/2018/08/07/breaking-osinbajo-sacks-dss-boss-lawal-daura/" },
          ],
        },
      ],
    },
    {
      slug: "atiku",
      name: "Atiku Abubakar",
      meta: "ADC · African Democratic Congress",
      final: -9.5,
      verdict: "Lowest score of the four",
      beats: [
        {
          points: 5,
          title: "Telecom opened up, and plans for security and jobs",
          why: "As vice president he chaired the privatisation council and the telecom reform that led to the 2001 GSM licences. Nigeria went from under 1% mobile coverage to over 200 million lines. Less a disputed privatisation record overall.",
          theirSide: "Critics, including Nasir El-Rufai, accuse him of interfering in privatisations. He denies it.",
          sources: [
            { label: "National Policy on Telecommunications 2000 (NESG)", url: "https://www.nesgroup.org/download_policy_drafts/National%20Policy%20on%20Telecommunications%20%282000%29_1661778547.pdf" },
            { label: "How the 2001 GSM auction was saved (TechEconomy)", url: "https://techeconomy.ng/new-book-reveals-how-atiku-joda-ndukwe-saved-2001-gsm-license-auction/" },
            { label: "Atiku and El-Rufai trade blame over NITEL (HumanIPO)", url: "https://humanipo.com/news/4995/nigerian-former-vice-president-and-minister-trade-blame-for-failure-of-nitel-privatisation" },
          ],
        },
        {
          points: -7,
          title: "Fuel subsidy, again",
          why: "He backed removing subsidy in 2023, then promised in August 2026 to 'fully restore' it, with no costed plan. His own spokespeople gave mixed messages. A costly reversal counts heavily.",
          theirSide: "His campaign says it is a production subsidy for locally refined fuel, not the old regime.",
          sources: [
            { label: "Atiku doubles down on restoring subsidy (AllAfrica)", url: "https://allafrica.com/stories/202608260085.html" },
            { label: "Atiku: I won't resurrect the old subsidy (Guardian)", url: "https://guardian.ng/?p=2903061" },
          ],
        },
        {
          points: -7,
          title: "US Senate report, Mambilla and PTDF",
          why: "A 2010 US Senate report found more than $40 million in 'suspect funds' moved into the US through his wife's accounts between 2000 and 2008. He has also been named in the PTDF and Mambilla controversies.",
          theirSide: "He was never charged in any of these. He denies wrongdoing and says 'an allegation is not a finding'.",
          sources: [
            { label: "Sen. Levin's statement on the 2010 report (US Senate)", url: "https://www.hsgac.senate.gov/imo/media/doc/OPENINGSenatorLevin.pdf" },
            { label: "No US indictment filed (Vanguard)", url: "https://www.vanguardngr.com/2017/12/u-s-senate-report-abubakar-atikus-albatross/" },
            { label: "Mambilla: Atiku's response (Leadership)", url: "https://leadership.ng/?p=704274" },
          ],
        },
        {
          points: -0.5,
          title: "Ticket voided in court, and his running mate",
          why: "On 5 November 2026 the Federal High Court nullified the ADC leadership that nominated him, putting his ticket in doubt. The appeal is pending, so the chance-to-win point is on hold. Running mate Rotimi Amaechi is net −0.5.",
          theirSide: "The ADC calls the ruling political and has appealed.",
          sources: [
            { label: "Court sacks ADC leadership (Blueprint)", url: "https://blueprint.ng/?p=859908" },
            { label: "INEC weighs ruling; ADC appeals (News Ghana)", url: "https://newsghana.com.gh/inec-weighs-ruling-that-voided-atikus-adc-ticket/" },
          ],
        },
      ],
    },
  ],
  takeaways: [
    "Nobody passed zero. Not one.",
    "Obi (−3.5) and Tinubu (−4) are half a point apart.",
    "Perfect candidates don't exist. Choose whose problems you can manage.",
  ],
};

const ELECTED = "Elected by voters: +1.";

export const EPISODE_1960: Episode = {
  id: "1960",
  number: "02",
  title: "Every leader since 1960",
  strap: "Sixteen governments, sixty-six years. The best score didn't reach five.",
  sharePath: "/em/1960",
  intro:
    "Same rules as Episode 01, but only what each leader did while in office counts. How they took power counts too. Tinubu is still in office, so his score is 'so far'.",
  rules: [
    ...SHARED_RULES,
    { label: "How they took power", points: "−2 to +1", why: "Elected +1. Succession or appointment 0. Counter-coup −1. Coup −2." },
  ],
  people: [
    {
      slug: "balewa", name: "Tafawa Balewa", meta: "Prime Minister · 1960–1966", final: 0, verdict: "We start from zero",
      beats: [
        { points: 1, title: "Chosen by parliament", why: "Prime Minister under the 1960 parliamentary system. President Azikiwe's role was ceremonial.", sources: [{ label: "Abubakar Tafawa Balewa (Wikipedia)", url: "https://en.wikipedia.org/wiki/Abubakar_Tafawa_Balewa" }] },
        { points: 3, title: "Independence without a shot, and a first national plan", why: "Led Nigeria to peaceful independence and launched the 1962–68 National Development Plan.", sources: [{ label: "Abubakar Tafawa Balewa (Wikipedia)", url: "https://en.wikipedia.org/wiki/Abubakar_Tafawa_Balewa" }] },
        { points: -4, title: "Census quarrels, the Western Region crisis, the 1964 election", why: "Disputed censuses, a state of emergency in the West and a boycotted, violent 1964 election tore at the federation.", sources: [{ label: "1964 Nigerian general election (Wikipedia)", url: "https://en.wikipedia.org/wiki/1964_Nigerian_general_election" }] },
      ],
    },
    {
      slug: "ironsi", name: "Aguiyi-Ironsi", meta: "Head of State · 1966", final: -2, verdict: "194 days",
      beats: [
        { points: 1, title: "Calmed the coup chaos a little", why: "Took control after the January 1966 coup and restored a measure of order. Succession, so no entry points.", sources: [{ label: "Johnson Aguiyi-Ironsi (Wikipedia)", url: "https://en.wikipedia.org/wiki/Johnson_Aguiyi-Ironsi" }] },
        { points: -3, title: "Decree 34 scrapped federalism overnight", why: "The Unification Decree abolished the regions. Riots followed, then the July counter-coup.", sources: [{ label: "Johnson Aguiyi-Ironsi (Wikipedia)", url: "https://en.wikipedia.org/wiki/Johnson_Aguiyi-Ironsi" }] },
      ],
    },
    {
      slug: "gowon", name: "Yakubu Gowon", meta: "Head of State · 1966–1975", final: -1, verdict: "Kept Nigeria one, broke his promise",
      beats: [
        { points: -1, title: "Brought in by a counter-coup", why: "Counter-coup: −1.", sources: [{ label: "Yakubu Gowon (Wikipedia)", url: "https://en.wikipedia.org/wiki/Yakubu_Gowon" }] },
        { points: 6, title: "Twelve states, 'no victor, no vanquished', NYSC", why: "Created 12 states, ended the civil war with reconciliation and founded the NYSC in 1973.", sources: [{ label: "Gowon's legacies (AllAfrica)", url: "https://allafrica.com/stories/202410240497.html" }, { label: "National Youth Service Corps (Wikipedia)", url: "https://en.wikipedia.org/wiki/National_Youth_Service_Corps" }] },
        { points: -3, title: "Oil-boom waste: Udoji and the cement armada", why: "Huge back-pay awards fuelled inflation, and hundreds of cement ships jammed Lagos port for months.", sources: [{ label: "Yakubu Gowon (Wikipedia)", url: "https://en.wikipedia.org/wiki/Yakubu_Gowon" }] },
        { points: -3, title: "Promised to hand over in 1976, then called it 'unrealistic'", why: "Set the 1976 date in 1970, reversed it on 1 October 1974 with no new date. A broken promise to the whole nation.", sources: [{ label: "Management of transitions, 1966–1996 (IFRA)", url: "https://books.openedition.org/ifra/634?lang=en" }, { label: "Memories of the 1975 coup (AllAfrica)", url: "https://allafrica.com/stories/202508040295.html" }] },
      ],
    },
    {
      slug: "murtala", name: "Murtala Mohammed", meta: "Head of State · 1975–1976", final: 1, verdict: "First plus on the board",
      beats: [
        { points: -2, title: "Came in by coup", why: "Coup: −2.", sources: [{ label: "Murtala Mohammed (Wikipedia)", url: "https://en.wikipedia.org/wiki/Murtala_Mohammed" }] },
        { points: 5, title: "Seven new states, the Abuja decision and a real handover date", why: "In about 200 days: 19 states, the move to Abuja, and a firm 1979 return to civilian rule.", sources: [{ label: "Management of transitions, 1966–1996 (IFRA)", url: "https://books.openedition.org/ifra/634?lang=en" }] },
        { points: -2, title: "Mass purge without hearings", why: "Over 10,000 public servants were dismissed with no due process.", sources: [{ label: "Murtala Mohammed (Wikipedia)", url: "https://en.wikipedia.org/wiki/Murtala_Mohammed" }] },
      ],
    },
    {
      slug: "obasanjo-military", name: "Olusegun Obasanjo (military)", meta: "Head of State · 1976–1979", final: 2, verdict: "Kept the date",
      beats: [
        { points: 5, title: "Handed over to an elected civilian in 1979", why: "Kept the transition date. Succession, so no entry points.", sources: [{ label: "Management of transitions, 1966–1996 (IFRA)", url: "https://books.openedition.org/ifra/634?lang=en" }] },
        { points: -3, title: "Kalakuta burnt, 'Ali Must Go' shootings, first jumbo loan", why: "Soldiers burnt Fela's compound in 1977; students were shot in the 1978 protests; Nigeria took its first large foreign loan.", sources: [{ label: "Kalakuta Republic (Wikipedia)", url: "https://en.wikipedia.org/wiki/Kalakuta_Republic" }, { label: "Olusegun Obasanjo (Wikipedia)", url: "https://en.wikipedia.org/wiki/Olusegun_Obasanjo" }] },
      ],
    },
    {
      slug: "shagari", name: "Shehu Shagari", meta: "President · 1979–1983", final: -2, verdict: "Elected, then the oil crash",
      beats: [
        { points: 1, title: "Elected", why: ELECTED, sources: [{ label: "Shehu Shagari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Shehu_Shagari" }] },
        { points: 2, title: "Green Revolution and low-cost housing", why: "Pushed food production and a national low-cost housing scheme.", sources: [{ label: "Shehu Shagari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Shehu_Shagari" }] },
        { points: -5, title: "Oil crash, import-licence scandal, debt and the 1983 'moonslide'", why: "Corruption around import licences, rising debt, and a widely rigged 1983 election.", sources: [{ label: "1983 Nigerian general election (Wikipedia)", url: "https://en.wikipedia.org/wiki/1983_Nigerian_general_election" }] },
      ],
    },
    {
      slug: "buhari-military", name: "Muhammadu Buhari (military)", meta: "Head of State · 1984–1985", final: -3, verdict: "Discipline, at a price",
      beats: [
        { points: -2, title: "Came in by coup", why: "Coup on New Year's Eve 1983: −2.", sources: [{ label: "Muhammadu Buhari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Muhammadu_Buhari" }] },
        { points: 3, title: "War Against Indiscipline, queues and fewer imports", why: "Public-order campaign and import cuts.", sources: [{ label: "War Against Indiscipline (Wikipedia)", url: "https://en.wikipedia.org/wiki/War_Against_Indiscipline" }] },
        { points: -4, title: "Detention without trial, jailed journalists, retroactive executions", why: "Decree 2 detentions, Decree 4 against the press, and executions under a drug law applied to crimes committed before it existed.", sources: [{ label: "Muhammadu Buhari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Muhammadu_Buhari" }] },
      ],
    },
    {
      slug: "babangida", name: "Ibrahim Babangida", meta: "Military President · 1985–1993", final: -6, verdict: "June 12",
      beats: [
        { points: -2, title: "Came in by coup", why: "Coup: −2.", sources: [{ label: "Ibrahim Babangida (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ibrahim_Babangida" }] },
        { points: 4, title: "Road Safety, Third Mainland Bridge, the move to Abuja", why: "Created the FRSC, completed the Third Mainland Bridge and moved the capital to Abuja in 1991.", sources: [{ label: "Ibrahim Babangida (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ibrahim_Babangida" }] },
        { points: -3, title: "SAP pain, and $12.4bn not properly accounted for", why: "The Okigbo panel found the Gulf War oil windfall run through special accounts outside the budget, with little left by 1994.", theirSide: "Babangida says the money was spent on infrastructure and denies he was indicted.", sources: [{ label: "Okigbo panel findings (UT Austin archive)", url: "https://www.laits.utexas.edu/africa/ads/698.html" }, { label: "Babangida explains the $12.4bn (Legit)", url: "https://www.legit.ng/nigeria/1642080-despite-okigbos-report-babangida-finally-explains-how-handled-124bn-gulf-war-oil-funds" }] },
        { points: -5, title: "Handover dates moved again and again, then June 12 annulled", why: "Repeated postponements, then the annulment of the 1993 election widely believed won by MKO Abiola.", sources: [{ label: "1993 Nigerian presidential election (Wikipedia)", url: "https://en.wikipedia.org/wiki/1993_Nigerian_presidential_election" }] },
      ],
    },
    {
      slug: "shonekan", name: "Ernest Shonekan", meta: "Interim Head · 1993", final: -1, verdict: "83 days",
      beats: [
        { points: -1, title: "Appointed, not elected, and ruled illegal", why: "Installed by Babangida; a Lagos High Court declared the interim government illegal in November 1993.", sources: [{ label: "Ernest Shonekan (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ernest_Shonekan" }] },
      ],
    },
    {
      slug: "abacha", name: "Sani Abacha", meta: "Head of State · 1993–1998", final: -8, verdict: "Bottom of the board",
      beats: [
        { points: -2, title: "Came in by coup", why: "Coup: −2.", sources: [{ label: "Sani Abacha (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sani_Abacha" }] },
        { points: 3, title: "Inflation came down, PTF roads, peacekeepers to Liberia", why: "Inflation fell from its 1995 peak; the Petroleum Trust Fund built roads; ECOMOG troops served in Liberia.", sources: [{ label: "Sani Abacha (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sani_Abacha" }] },
        { points: -5, title: "Ken Saro-Wiwa hanged, Abiola detained till death, Commonwealth suspension", why: "The Ogoni Nine were executed in 1995 and Nigeria was suspended from the Commonwealth.", sources: [{ label: "Ken Saro-Wiwa (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ken_Saro-Wiwa" }] },
        { points: -4, title: "Over $3.6bn of loot recovered from abroad", why: "About $3.6–3.65bn linked to Abacha has been returned to Nigeria from 1998 to 2020.", sources: [{ label: "$3.6bn recovered, tranche by tranche (TheCable)", url: "https://www.thecable.ng/?p=449311" }, { label: "$3.65bn recovered in 24 years (Arise)", url: "https://www.arise.tv/3-65bn-abacha-loot-recovered-by-nigeria-in-24-years/" }] },
      ],
    },
    {
      slug: "abdulsalami", name: "Abdulsalami Abubakar", meta: "Head of State · 1998–1999", final: 4, verdict: "Number one",
      beats: [
        { points: 4, title: "Freed prisoners, recovered $750m, handed over in under a year", why: "Released political detainees, recovered $750m from the Abacha family and handed power to an elected government on 29 May 1999. Succession, so no entry points.", sources: [{ label: "Prisoners released (IPS, 1998)", url: "https://www.ipsnews.net/?p=62970" }, { label: "$750m recovered in 1998 (BusinessDay)", url: "https://businessday.ng/?p=413649" }] },
      ],
    },
    {
      slug: "obasanjo-civilian", name: "Olusegun Obasanjo (civilian)", meta: "President · 1999–2007", final: 3, verdict: "Number two: came back better",
      beats: [
        { points: 1, title: "Elected", why: ELECTED, sources: [{ label: "Olusegun Obasanjo (Wikipedia)", url: "https://en.wikipedia.org/wiki/Olusegun_Obasanjo" }] },
        { points: 7, title: "$18bn Paris Club debt written off, GSM, the EFCC", why: "Secured an $18bn (60%) Paris Club write-off in 2005, opened telecoms to GSM in 2001 and created the EFCC.", sources: [{ label: "Okonjo-Iweala on the debt relief (Brookings)", url: "https://www.brookings.edu/wp-content/uploads/2012/04/2007okonjoiweala.pdf" }, { label: "The 2001 GSM auction (Techpoint)", url: "https://techpoint.africa/insight/gsm-licence-sale-built-tech-foundation/" }] },
        { points: -4, title: "Odi and Zaki Biam, then the 2007 election", why: "Military reprisals destroyed Odi (1999) and Zaki Biam (2001). The 2007 election he oversaw was among Nigeria's worst.", sources: [{ label: "Odi massacre (Wikipedia)", url: "https://en.wikipedia.org/wiki/Odi_massacre" }, { label: "Electoral reform after 2007 (ThisDay)", url: "https://www.thisdaylive.com/2021/08/02/the-long-tortuous-journey-to-electoral-reforms/" }] },
        { points: -1, title: "The third-term push", why: "A 2006 amendment that would have allowed a third term failed in the Senate.", theirSide: "Obasanjo denies he sought a third term.", sources: [{ label: "Olusegun Obasanjo (Wikipedia)", url: "https://en.wikipedia.org/wiki/Olusegun_Obasanjo" }] },
      ],
    },
    {
      slug: "yaradua", name: "Umaru Musa Yar'Adua", meta: "President · 2007–2010", final: 2.5, verdict: "Number three: half a point again",
      beats: [
        { points: -0.5, title: "Admitted the election that brought him in was flawed", why: "His inaugural speech acknowledged 'shortcomings'; he set up the Uwais electoral reform committee. Entry scored −0.5 instead of +1.", sources: [{ label: "Yar'Adua admits flaws (ThisDay)", url: "https://www.thisdaylive.com/2021/08/02/the-long-tortuous-journey-to-electoral-reforms/" }] },
        { points: 4, title: "Niger Delta amnesty", why: "The 2009 amnesty disarmed militants and oil output recovered.", sources: [{ label: "Umaru Musa Yar'Adua (Wikipedia)", url: "https://en.wikipedia.org/wiki/Umaru_Musa_Yar%27Adua" }] },
        { points: 1, title: "Declared his assets publicly", why: "The first Nigerian president to publish his asset declaration.", sources: [{ label: "Umaru Musa Yar'Adua (Wikipedia)", url: "https://en.wikipedia.org/wiki/Umaru_Musa_Yar%27Adua" }] },
        { points: -2, title: "Months abroad, nobody in charge", why: "His long illness left a power vacuum until the 'doctrine of necessity' in 2010.", sources: [{ label: "Umaru Musa Yar'Adua (Wikipedia)", url: "https://en.wikipedia.org/wiki/Umaru_Musa_Yar%27Adua" }] },
      ],
    },
    {
      slug: "jonathan", name: "Goodluck Jonathan", meta: "President · 2010–2015", final: 2, verdict: "Lost, and congratulated the winner",
      beats: [
        { points: 1, title: "Elected in 2011", why: ELECTED, sources: [{ label: "Goodluck Jonathan (Wikipedia)", url: "https://en.wikipedia.org/wiki/Goodluck_Jonathan" }] },
        { points: 6, title: "FOI Act, power sector sold, and a first-ever concession", why: "Signed the Freedom of Information Act (2011), privatised power generation and distribution (2013), and in 2015 became the first sitting president to concede defeat.", sources: [{ label: "Goodluck Jonathan (Wikipedia)", url: "https://en.wikipedia.org/wiki/Goodluck_Jonathan" }] },
        { points: -3, title: "Boko Haram grew; 276 Chibok girls taken", why: "The insurgency spread, and 276 schoolgirls were abducted from Chibok in April 2014.", sources: [{ label: "Chibok schoolgirls kidnapping (Wikipedia)", url: "https://en.wikipedia.org/wiki/Chibok_schoolgirls_kidnapping" }] },
        { points: -2, title: "Subsidy scam and arms-money scandal", why: "Fuel-subsidy fraud and the arms-procurement funds scandal. Several cases remain in court.", sources: [{ label: "Goodluck Jonathan (Wikipedia)", url: "https://en.wikipedia.org/wiki/Goodluck_Jonathan" }] },
      ],
    },
    {
      slug: "buhari-civilian", name: "Muhammadu Buhari (civilian)", meta: "President · 2015–2023", final: -2, verdict: "Came back only a little better",
      beats: [
        { points: 1, title: "Elected", why: ELECTED, sources: [{ label: "Muhammadu Buhari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Muhammadu_Buhari" }] },
        { points: 5, title: "Rail lines, Second Niger Bridge, Petroleum Industry Act", why: "New standard-gauge rail lines, the Second Niger Bridge and the long-delayed PIA (2021).", sources: [{ label: "Second Niger Bridge (Wikipedia)", url: "https://en.wikipedia.org/wiki/Second_Niger_Bridge" }] },
        { points: -6, title: "Two recessions, unemployment from 8% to 33%, Twitter ban", why: "Recessions in 2016 and 2020. NBS unemployment rose from 8.2% (Q2 2015) to 33.3% (Q4 2020). Twitter was banned for seven months in 2021.", sources: [{ label: "Unemployment 8.2% to 33.3% (BusinessDay)", url: "https://clone.businessday.ng/?p=728368" }] },
        { points: -2, title: "'Three million jobs a year'", why: "A 2015 campaign promise that was never met.", sources: [{ label: "Muhammadu Buhari (Wikipedia)", url: "https://en.wikipedia.org/wiki/Muhammadu_Buhari" }] },
      ],
    },
    {
      slug: "tinubu-so-far", name: "Bola Tinubu (so far)", meta: "President · 2023–", final: 1, verdict: "Still in office",
      beats: [
        { points: 1, title: "Elected", why: ELECTED, sources: [{ label: "INEC 2023 result (Leadership)", url: "https://leadership.ng/15-presidential-candidates-line-up-against-tinubu/" }] },
        { points: 8, title: "Inflation down to 14%, reserves up, minimum wage more than doubled", why: "Same evidence as Episode 01: inflation 14.06% in October 2026, reserves above $50bn, minimum wage ₦70,000.", sources: [{ label: "Inflation eases to 14.06% (Guardian)", url: "https://guardian.ng/news/inflation-eases-to-14-06-second-consecutive-month-of-decline/" }, { label: "₦70,000 minimum wage (Order Paper)", url: "https://orderpaper.ng/?p=22260" }] },
        { points: -6, title: "Poverty, kidnapping, hunger", why: "World Bank: 63% in poverty in 2025. SBM: kidnappings up 66%.", sources: [{ label: "World Bank: 63% (AllAfrica)", url: "https://allafrica.com/stories/202604100079.html" }, { label: "SBM kidnap report (Nairametrics)", url: "https://nairametrics.com/2026/08/27/nigerians-pay-n7-78-billion-ransom-as-kidnappings-surge-66/" }] },
        { points: -1, title: "Protesters, children among them, charged with treason", why: "In November 2024, 119 #EndBadGovernance protesters including minors were arraigned for treason. Charges were dropped days later.", sources: [{ label: "Court frees 119 protesters (ThisDay)", url: "https://thisdaylive.com/index.php/2024/11/05/relief-as-fg-withdraws-treason-charge-against-endbadgovernance-protesters" }] },
        { points: -1, title: "Halve youth unemployment, with no clear plan", why: "A 2031 target in the new manifesto, repeating unmet 2023 pledges.", sources: [{ label: "2027–2031 manifesto (Arise)", url: "https://www.arise.tv/what-tinubus-2027-2031-manifesto-promises-on-jobs-housing-security-and-the-economy/" }] },
      ],
      note: "His pre-office record (the 1993 US case) is scored in Episode 01, not here.",
    },
  ],
  takeaways: [
    "Number one: Abdulsalami (+4). His biggest achievement? He left on time.",
    "Sixty-six years, and nobody passed four.",
    "Obasanjo came back better. Buhari, only a little.",
  ],
};

export const EPISODES = [EPISODE_2027, EPISODE_1960];
export const AS_OF = "18 November 2026";
