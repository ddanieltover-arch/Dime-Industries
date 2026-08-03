"""Generate seeded link_building_crm.csv (50 prospects) for Section 9."""
from pathlib import Path

rows = [
    # Tier, Domain, DR, Contact, Email, Status, Notes
    ("1", "leafly.com", "80", "Brand partnerships / corrections", "research-needed", "Research", "Unlinked brand mentions → www"),
    ("1", "weedmaps.com", "85", "Listing owner", "research-needed", "Research", "Official website field = www"),
    ("1", "yelp.com", "90", "Business owner", "n/a-self-serve", "Research", "GBP/citation consistency — not classic link"),
    ("1", "tripadvisor.com", "90", "n/a", "research-needed", "Research", "Only if brand page exists"),
    ("1", "facebook.com", "90", "Page admin", "n/a-self-serve", "Research", "About link → www"),
    ("1", "instagram.com", "90", "Bio link", "n/a-self-serve", "Research", "Link in bio → www"),
    ("1", "linkedin.com", "90", "Company page", "n/a-self-serve", "Research", "Website = www"),
    ("1", "crunchbase.com", "80", "Suggest edit", "research-needed", "Research", "Company URL update"),
    ("1", "bloomberg.com", "90", "Corrections", "research-needed", "Research", "If prior .com mentions"),
    ("1", "businesswire.com", "70", "Wire archive", "research-needed", "Research", "Update canonical in future releases"),
    ("2", "mjbizdaily.com", "70", "News editor", "research-needed", "Queued", "Authenticity Pulse PR"),
    ("2", "cannabisbusinesstimes.com", "65", "Features editor", "research-needed", "Queued", "Data study pitch"),
    ("2", "benzinga.com", "80", "Cannabis desk", "research-needed", "Research", "Press release"),
    ("2", "newcannabisventures.com", "55", "Editor", "research-needed", "Research", "Product/education news"),
    ("2", "sfchronicle.com", "75", "Business desk", "research-needed", "Research", "CA brand / authenticity"),
    ("2", "latimes.com", "85", "Food/business", "research-needed", "Research", "HARO + PR"),
    ("2", "boston.com", "70", "Local news", "research-needed", "Research", "MA market availability"),
    ("3", "mgmagazine.com", "50", "Editor", "research-needed", "Queued", "Guest: Validate literacy"),
    ("3", "cannabisnow.com", "50", "Editor", "research-needed", "Queued", "Guest: fake carts guide"),
    ("3", "ganjapreneur.com", "50", "Editor", "research-needed", "Queued", "Guest: GEO trust pages"),
    ("3", "hmretailer.com", "45", "Editor", "research-needed", "Queued", "Retail staff checklist"),
    ("3", "greenentrepreneur.com", "55", "Editor", "research-needed", "Research", "Trust signals online"),
    ("3", "hightimes.com", "70", "Editor", "research-needed", "Compliance hold", "Needs legal review of draft"),
    ("3", "friendsofthefarm.com", "40", "Editor", "research-needed", "Research", "CA spotlight"),
    ("3", "vaping360.com", "50", "Editor", "research-needed", "Research", "Cart battery how-to scoped"),
    ("4", "halaracannabis.com", "45", "n/a-source", "n/a", "Research", "Run Ahrefs broken backlinks"),
    ("4", "binske.com", "45", "n/a-source", "n/a", "Research", "Run Ahrefs broken backlinks"),
    ("4", "howmanydimesinaroll.com", "20", "Site owner", "research-needed", "Research", "Offer better citation / reciprocity careful"),
    ("4", "stiiizy.com", "55", "n/a-source", "n/a", "Research", "Broken backlink intersect"),
    ("4", "rawgarden.farm", "50", "n/a-source", "n/a", "Research", "Broken backlink intersect"),
    ("5", "timeout.com", "70", "City editors LA/Boston", "research-needed", "Research", "Listicle inclusion"),
    ("5", "thrillist.com", "70", "Commerce/lifestyle", "research-needed", "Research", "Authenticity listicle"),
    ("5", "bostonmagazine.com", "60", "Editor", "research-needed", "Research", "MA licensed brands"),
    ("5", "allure.com", "75", "n/a", "research-needed", "Compliance hold", "Avoid medical wellness pitches"),
    ("5", "reddit.com", "90", "Community", "n/a", "Research", "Nofollow brand answers"),
    ("5", "quora.com", "80", "Self", "n/a-self-serve", "Research", "Expert answers → trust/glossary"),
    ("5", "wikipedia.org", "90", "Editors", "n/a", "Compliance hold", "Notability first — deferred"),
    ("5", "wikidata.org", "85", "Self", "n/a-self-serve", "Research", "Official website claim"),
    ("6", "connectively.com", "—", "Daily queries", "platform", "Queued", "5–10 pitches/week"),
    ("6", "featured.com", "—", "Daily queries", "platform", "Queued", "Expert signup"),
    ("6", "qwoted.com", "—", "Daily queries", "platform", "Queued", "Expert signup"),
    ("6", "helpab2bwriter.com", "—", "Daily queries", "platform", "Research", "B2B retail angles"),
    ("7", "spotify.com", "90", "Podcast hosts", "research-needed", "Research", "Show-notes link target /trust"),
    ("7", "apple.com", "90", "Podcast hosts", "research-needed", "Research", "Same as Spotify"),
    ("7", "youtube.com", "90", "Creators", "research-needed", "Research", "Description link hygiene"),
    ("7", "substack.com", "70", "Newsletter eds", "research-needed", "Queued", "Exclusive data offer"),
    ("7", "cannabiz-report-style-podcast", "40", "Host", "research-needed", "Research", "Confirm exact show name"),
    ("7", "local-ca-cannabis-podcast", "35", "Host", "research-needed", "Research", "Verify DR/traffic ≥ thresholds"),
    ("7", "ma-cannabis-newsletter", "35", "Editor", "research-needed", "Research", "5k+ subs preferred"),
    ("1", "instagram-retailer-tags", "—", "Retail partners", "research-needed", "Research", "Ask partners to link www in bio posts"),
]

assert len(rows) == 50, len(rows)

header = [
    "Prospect Domain",
    "Est DR",
    "Contact Name",
    "Email",
    "Outreach Date",
    "Follow-up 1 Date",
    "Follow-up 2 Date",
    "Status",
    "Link Acquired (Y/N)",
    "Link URL",
    "Tier",
    "Notes",
]

lines = [",".join(header)]
for tier, domain, dr, contact, email, status, notes in rows:
    lines.append(
        ",".join(
            [
                domain,
                dr,
                f'"{contact}"',
                email,
                "",
                "",
                "",
                status,
                "N",
                "",
                tier,
                f'"{notes}"',
            ]
        )
    )

out = Path("docs/seo/link_building_crm.csv")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Wrote {len(rows)} rows -> {out}")
