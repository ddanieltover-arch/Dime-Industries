// lib/cms/store.ts
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEFAULT_HOMEPAGE_LAYOUT, normalizeHomepageLayout } from "./homepage-layout";
import type { BlogPost, CmsPage, HomepageBanner, HomepageLayout } from "./types";

/** Fail soft instead of hanging the storefront when Postgres stalls. */
const CMS_DB_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[cms] ${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export const CMS_COOKIE = "dime_cms";

const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  status: z.enum(["draft", "published"]),
  updatedAt: z.string(),
});

const postSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: z.string(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string(),
  updatedAt: z.string(),
});

const bannerSchema = z.object({
  enabled: z.boolean(),
  headline: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

const jarSchema = z.object({
  pages: z.array(pageSchema),
  posts: z.array(postSchema),
  banner: bannerSchema,
  layout: z.unknown().optional(),
  seeded: z.boolean().optional(),
});

const DEFAULT_PAGES: CmsPage[] = [
  {
    slug: "about",
    title: "About Us",
    body: "DIME Industries is a licensed cannabis brand founded in 2016. We make award-winning vapes, gummies, softgels, and prerolls - and we engineer our own hardware instead of buying generic parts.\n\n### Our commitment\nInnovation takes center stage. Our unwavering commitment to excellence has garnered more than 30 prestigious awards and recognition in leading industry publications.\n\n### Where we sell\nShop online for delivery in California and Massachusetts. Find neighborhood retailers nationwide via Find DIME.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    body: "### What is DIME Industries?\nDIME Industries is a licensed cannabis brand founded in 2016. DIME makes vapes, gummies, softgels, and prerolls, and engineers its own hardware. The brand has won more than 100 industry awards.\n\n### Where can I find the closest store?\nUse Find DIME on this site to browse locations by state, or shop online for CA and MA delivery.\n\n### How do I know my DIME product is authentic?\nScratch the validation code on the package, then register it at Validate. Validation confirms authenticity and unlocks limited warranty, loyalty points, and early access.\n\n### What products does DIME make?\nAll-in-one vapes, tanks, 510-thread batteries, gummies, softgels, and prerolls across Signature, Live Reserve, Balanced, Rosin, State Exclusive, and Collaborations lines.\n\n### Does DIME run sales or a rewards program?\nYes. See Promotions for current offers. Rewards members earn points, discounts, and early access when they validate products and shop.\n\n### Will another brand's battery work with a DIME tank?\nMost 510 batteries work, but air-draw batteries without a button and weaker batteries under 3.7v often fail. Use a DIME 5th Gen battery for best results.\n\n### What is the shelf life of edibles?\nSeveral months when stored cool and dry.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "contact",
    title: "Contact",
    body: "### Email\nsales@dimeindustries.us\n\n### Wholesale\nsales@dimeindustries.us · Apply at /wholesale\n\n### Privacy requests\nsales@dimeindustries.us\n\nInclude your order ID from the confirmation email for order issues. For authenticity or warranty, use Validate with your package code.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "careers",
    title: "Careers",
    body: "### Build with DIME\nWe're always looking for people who care about craft hardware, compliance, and brand excellence.\n\n### How to apply\nSend a short intro and resume to sales@dimeindustries.us with the role you're interested in.\n\n### Culture\nLab-tested standards apply to how we work too - clear ownership, quality over shortcuts, and respect for regulated markets.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "promotions",
    title: "Promotions",
    body: "### Current offers\nCheck back often for drops, bundle deals, and member-only promotions.\n\n### Rewards members\nValidate your products and shop while logged in to earn points toward discounts and early access.\n\n### Stay notified\nJoin the members newsletter on the homepage for drop alerts.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "links",
    title: "Quick Links",
    body: "### Shop\nBrowse the full catalog at /shop\n\n### Validate products\n/validate\n\n### Lab results\n/lab-results\n\n### Rewards\n/rewards\n\n### DIME App\n/app\n\n### AI Assistant\n/assistant\n\n### Find DIME\n/locations\n\n### Wholesale\n/wholesale",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/terms",
    title: "Terms of Service",
    body: "By using this platform you confirm you are 21+ (or a qualifying medical patient where applicable) and that cannabis products are legal in your jurisdiction.\n\n### Orders\nOrders are fulfilled only where permitted. Prices exclude tax until checkout. Retail prices are sourced from licensed marketplace menus (Eaze CA; Rolling Releaf MA where noted) and may differ by jurisdiction or format.\n\n### Accounts\nYou are responsible for keeping login credentials secure and for activity under your account.\n\n### Changes\nWe may update these terms; continued use after notice constitutes acceptance.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/privacy",
    title: "Privacy Policy",
    body: "We collect account, order, and device data needed to operate the storefront, process payments, and meet compliance obligations.\n\n### What we don't do\nWe do not sell personal information.\n\n### Requests\nContact sales@dimeindustries.us for access, correction, or deletion requests where applicable.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/medical-privacy",
    title: "Medical Privacy Policy",
    body: "If medical patient flows are enabled, medical information is handled under this medical privacy notice and access controls.\n\nMedical status is optional and unused at the flat 21+ launch gate.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/returns",
    title: "Returns Policy",
    body: "Defective hardware may be eligible for exchange when validated through our product registration flow and purchased from a licensed source.\n\nContact support with photos, retailer details, and your order ID.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/wholesale-rewards",
    title: "Wholesale Rewards Terms",
    body: "Wholesale rewards, if offered, are available only to approved wholesale accounts in good standing.\n\nPoints, rebates, or incentives may be adjusted or revoked for policy violations, chargebacks, or inactive accounts. Contact sales@dimeindustries.us for program details.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "wholesale",
    title: "Wholesale",
    body: "Apply at /wholesale for DIME B2B pricing. Approved accounts get wholesale tiers with NET-30, NET-60, or Bitcoin upfront.\n\nQuestions: sales@dimeindustries.us",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

export const DEFAULT_POSTS: BlogPost[] = [
  {
    slug: "built-to-beat-leaks-the-dime-hardware-story",
    title: "Built to Beat Leaks: The DIME Hardware Story Since 2016",
    excerpt:
      "Since 2016, DIME has engineered its own vape hardware to fix tank leaks, leftover oil, and weak batteries - ceramic plates, USB-C batteries, and a universal 510 thread.",
    body: `Quick Answer: DIME has engineered its own vape hardware since 2016 to reduce tank leaks, leftover oil, and weak batteries — with ceramic heating plates, USB-C batteries, and a universal 510 thread on lab-tested carts.

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.

### Key takeaways

DIME has engineered its own vape hardware since 2016. The brand set out to fix tank leaks, leftover oil, and weak batteries. A zero-waste atomizer uses ceramic plates instead of a coil. A 5th generation battery charges over USB-C. A universal 510 thread keeps the system flexible and easy to use.

### A mission that began in 2016

DIME Industries opened in 2016 with a mission. The brand set out to pioneer better cannabis vapes. Its goal was to solve the everyday challenges of the cannabis landscape.

In DIME's own words, the brand has conquered tank leaks, leftover oil, and low battery life. None of those fixes happened by accident. Each one started with a leak, a frustration, and an idea.

### Engineering with purpose

DIME did not start with a slogan. It started with engineering. The brand looked at every weak point in a typical vape, then built hardware to address those weak points one by one. Each part of the device got a purpose. That focus still shapes the lineup today.

### The 1000mg tank, built to hold

A leaky tank ruins the experience fast. So DIME built its 1000mg tank from premium materials - stainless steel, ceramic, and heavy-duty PTFE. These materials resist heat and hold up over time. DIME's all-in-one devices also add a clear window for an easy oil check. The build aims for durability and a consistently clean taste.

### The zero-waste atomizer

Leftover oil is wasted money. DIME answered with a zero-waste atomizer that uses two ceramic plates instead of a coil. These plates heat the oil evenly with every hit. They handle thick extracts too, from live resin to rosin and diamond concentrates. Almost nothing gets left behind in the tank - you enjoy more of what you paid for.

### The 5th generation battery

A dying battery cuts a session short. DIME's 5th generation vape pen battery helps with that in 650mAh and 400mAh options. It charges over USB-C, ships with a protective carrying case, and offers five heat settings plus a preheat function. DIME built it to be long-lasting and ready to go.

### Precision heat: TurboChip and SmartChip

Heat makes or breaks a vape. DIME built two custom chips to control it. The TurboChip holds steady heat regardless of battery level, with settings between 375°F and 480°F. The SmartChip focuses on flavor preservation and is designed to prevent overburn so hits stay smooth. Lower settings shine with rosin pens like the DIME Rosin line.

### The universal 510 thread

DIME tanks use a universal 510 thread that fits the DIME battery and many other 510 devices. That flexibility makes the system easy to live with - you are not locked into a single part. The brand still recommends its own battery for full performance.

### Hardware at a glance

Dual ceramic heating plates heat oil evenly with no coil for cleaner flavor and less waste. The zero-waste atomizer vaporizes nearly all the oil. The 1000mg tank holds oil in lab-grade materials. The 5th generation battery powers sessions with USB-C charging. TurboChip holds steady heat at any battery level. SmartChip guards against overburn. The universal 510 thread fits the tank and many 510 carts. These reflect DIME's design goals, not performance guarantees.

### Expert insight

Battery voltage drops as you vape, and heat and flavor can fade as that happens. DIME's TurboChip holds a steady temperature regardless of battery level - that is why the last hit can taste much like the first.

### Frequently asked questions

### Is every DIME vape built with the same hardware?

Most DIME vapes share the brand's core hardware, including dual ceramic heating plates and a zero-waste atomizer. Specs like tank size and battery can vary by line. Each device aims for the same clean, consistent experience.

### Are DIME tanks compatible with other 510 batteries?

DIME tanks use a universal 510 thread, so they fit many 510 devices. For full performance, DIME recommends its own battery, tuned to match its tanks and ceramic heating system.

### Is the DIME battery rechargeable?

Yes. DIME's batteries charge over USB-C. The all-in-one device reaches a usable charge in about 15 minutes, which means less downtime between sessions.

### Are ceramic heating plates better than coils?

Ceramic plates heat oil evenly without a wick to dry out and burn. DIME uses two plates instead of a coil. Many users find this delivers cleaner flavor and less leftover oil. Preference still varies by person.

### Thinking higher, part by part

DIME's hardware story is steady problem-solving. The brand saw leaks, waste, and weak batteries, then engineered around each one since 2016. The result is a vape built for flavor, value, and consistency.

Ready to shop? Browse [DIME vapes](/shop/vapes), look up [lab results](/lab-results), or [find a retailer near you](/locations).`,
    status: "published",
    publishedAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-08-02T21:00:00.000Z",
  },
  {
    slug: "dime-prerolls-are-coming-meet-dimepack-double-ds",
    title: "DIME Prerolls Are Coming: Meet DIMEPACK, Double D's & the Donut",
    excerpt:
      "Three premium DIME prerolls are coming soon - DIMEPACK travel 10-packs, shareable Double D's, and the live-rosin Donut. Premium flower only, never trim or shake.",
    body: `Quick Answer: DIME prerolls are coming in three styles — DIMEPACK travel 10-packs, shareable Double D's, and the live-rosin Donut — each built with premium indoor flower (never trim or shake) for licensed markets.

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.

### Key takeaways

DIME prerolls are coming soon in three premium styles. DIMEPACK is a 10-pack in a reusable, airtight travel case. Double D's pairs two indoor-flower rolls in a shareable pack. The DIME Donut is a top-shelf roll with a live rosin center. Every roll uses premium flower, never trim or shake. DIME's award-winning quality and Think Higher standard set it apart.

### The wait is almost over

Plenty of brands roll a joint. Few roll like DIME. That gap is the whole story.

Three new DIME prerolls are coming soon. Each one carries the brand's award-winning quality. Since 2016, DIME has led with sophistication, trust, and innovation - and that same standard now rolls into every joint.

### What sets DIME apart

Not every preroll earns its price. Many rely on trim, shake, or filler. DIME goes the other way. Every roll starts with premium, top-shelf flower. DIME never uses trim or shake. That choice shows up in every draw.

DIME also brings receipts. The brand is recognized for clean, potent products and award-winning quality built since 2016, one award at a time.

### Meet the DIME preroll lineup

DIME is launching three prerolls, each for a different moment. All three are coming soon.

### DIMEPACK: the 10-pack built to travel

The DIMEPACK loads ten premium prerolls into one case. Each roll carries a Signature Line terpene infusion for elevated flavor. The case is airtight, water-resistant, and reusable - it guards freshness and travels without a fuss.

### Double D's: two rolls made to share

Double D's (Double Dimes) keeps things simple. You get two rolls of 100% premium indoor flower, hand-selected from top growers. A reusable 12mm glass tip gives a cool, smooth hit. The scored pack tears in two for easy sharing - one roll for you, one to pass around.

### The DIME Donut: a live rosin center

The DIME Donut is the showpiece - a top-shelf flower preroll infused down the center with cold-cured live rosin. As it burns, the rosin melts from the middle out and leaves the signature donut hole in the ash. A reusable 12mm glass tip keeps the draw cool and controlled. No trim. No shake. Just flower and live rosin.

### Which roll fits the moment?

DIMEPACK is built for stocking up and travel. Double D's is made for sharing with a friend. The DIME Donut is a top-shelf solo session. Live rosin is solventless, so it keeps more of the plant's terpenes - the compounds behind bold flavor.

### Expert insight

DIME builds the Donut around a live rosin core. That center burns slower than the flower around it. The result is the signature donut hole and a steady drip of flavor. Cold-cured live rosin keeps the terpenes intact - award-winning craft, rolled and ready to go.

### The DIME standard behind every roll

DIME has led with sophistication, trust, and innovation since 2016, with more than 100 awards and national recognition along the way. That pedigree now backs every preroll. Each roll uses clean, potent, top-shelf flower, and official products carry a COA so you can check results first. That is what Think Higher means in practice.

### How to pick your DIME roll

Stocking up or heading out? Grab the DIMEPACK. Smoking with a friend? Split a pack of Double D's. Chasing top-shelf flavor? Reach for the DIME Donut.

### Frequently asked questions

### Are DIME prerolls available yet?

Not yet. DIME prerolls are marked coming soon. The lineup includes the DIMEPACK, Double D's, and the DIME Donut. Check [Prerolls](/shop/prerolls) and [Find DIME](/locations) for availability in your market.

### Are DIME prerolls infused?

Some are. The DIME Donut has a cold-cured live rosin center. The DIMEPACK carries a Signature Line terpene infusion. Double D's is straight premium indoor flower, not infused.

### Is the DIME Donut a hash-hole style roll?

Yes - it is DIME's take on that style, with live rosin down the center. As it burns, the rosin melts from the middle and leaves a donut-shaped hole.

### Are DIME prerolls made with premium flower?

Yes. DIME uses top-shelf, 100% premium indoor flower and skips trim and shake. Each roll aims for a clean, high-end smoking experience.

### The bottom line

DIME prerolls bring the brand's award-winning standard to a classic format - premium flower, real craft, and three styles for any moment. Browse [prerolls](/shop/prerolls), validate authenticity at [Validate](/validate), or [find a licensed retailer](/locations).

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.`,
    status: "published",
    publishedAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-08-02T21:00:00.000Z",
  },
  {
    slug: "how-dime-state-exclusives-capture-a-place",
    title: "How DIME State Exclusives Capture a Place in Every Draw",
    excerpt:
      "State Exclusive flavors turn a region's spirit into a vape - from California Tropicali to Arizona Cactus Chill - on the same trusted DIME hardware with a COA on every pack.",
    body: `Quick Answer: DIME State Exclusives are region-inspired vape flavors — from California Tropicali to Arizona Cactus Chill — built on the same engineered DIME hardware with a COA on every pack, sold through licensed retailers.

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.

### Key takeaways

DIME State Exclusives celebrate the spirit of each state. Every flavor reflects a state's landscapes, culture, and experiences. The line pairs bold, tailored profiles with custom premium packaging. The same trusted DIME hardware powers every State Exclusive vape. A COA on each package backs the brand's quality promise.

### Flavor with a sense of place

Picture the Arizona desert at dusk. The heat breaks, the sky glows pink, that cool calm air is Cactus Chill - sweet pineapple and zesty citrus the southwest knows. Or California coast at golden hour: waves, salt air, and a bright sunny rush called Tropicali - sweet pineapple kissed with fresh berry.

These are feelings and flavors built to taste like home. They carry a whole place inside one name. DIME chases that exact feeling with its State Exclusives. Each one turns a state's character into a vape you can taste. Local spirit, sweeping landscapes, and lived experiences guide the flavor - that is how DIME captures a place in every single draw.

### The idea behind State Exclusives

None of this happens by accident. DIME never picks a flavor at random. Each State Exclusive starts with a single state in mind. The team studies its spirit, landscapes, and everyday moments, then builds around a thoughtfully crafted strain. The brand wants more than a tasty puff - it wants a genuine tribute to the region.

### State Exclusive lineup

Tropicali (California) is a sativa that tastes like the coast - sweet tropical fruit, pineapple, and fresh berry (Blackberry Kush × Lemon Diesel). Cactus Chill (Arizona) is a hybrid built for desert heat - sweet pineapple meets zesty citrus (Pineapple OG × Tangie). Bombsicle (Oklahoma) packs summer nostalgia with tangy blue razz, sweet cherry, and cool lemon (Guava × Blue Steel). Huckleberry Jam (Montana) is an indica built on sweet and tart wild huckleberry (Blueberry × Cherry Pie). Zia Fresca (New Mexico) is a sativa inspired by agua fresca - ripe watermelon meets tangy lime (Watermelon Kush × Zprite).

Flavor notes describe taste and aroma. Availability varies by state and market.

### Where place meets flavor

The bond between place and flavor runs deep in cannabis. Wine lovers call it terroir - climate, soil, and sun shape a plant's terpenes, the compounds behind aroma and taste. DIME taps that same spirit through flavor design. The brand cannot bottle a state's weather or soil, so it captures the feeling instead.

### Crafted, not generic

A State Exclusive is never an afterthought. DIME crafts each one like a small love letter with bold, tailored flavor profiles. No two states ever taste the same. The brand wraps each drop in custom premium packaging so you feel the theme before you ever inhale.

### Built on the same DIME standard

State Exclusives run on DIME's core technology - the zero-waste atomizer and dual ceramic heating plates, plus a universal 510 thread. Every official package carries a COA on the side. You can view full test results on [Lab Results](/lab-results). So you get rich flavor and proven quality in one device.

### How DIME turns a state into a vape

Every State Exclusive starts with a question: what does this place feel like, and what would that feeling taste like? Local spirit becomes a flavor tuned to the state's vibe. Iconic landscapes become tasting notes that echo the scenery. Hometown experiences become a familiar feeling in every draw. Regional pride becomes a limited tribute you will not find elsewhere.

### Expert insight

Scent ties tightly to memory. One whiff can drop you back into a single moment. Terpenes give each strain its signature aroma and taste. DIME channels that power to honor a state - the right draw can feel like a postcard home.

### Frequently asked questions

### Are DIME State Exclusives real cannabis products?

Yes. State Exclusives are one of DIME's vape lines. Each flavor celebrates the essence of a specific state with bold, tailored profiles and custom premium packaging. Availability can vary by market.

### Is each State Exclusive flavor different?

Yes. DIME designs each State Exclusive around one state's character - local spirit, landscapes, and experiences. No two releases aim for the same profile.

### Are State Exclusives made with the same DIME hardware?

Yes. They use DIME's core technology, including the zero-waste atomizer, dual ceramic plates, and universal 510 thread.

### Is a COA available for State Exclusives?

Yes. Every official DIME package carries a COA on the side, and you can view test results on [Lab Results](/lab-results).

### A tribute in every draw

DIME State Exclusives prove flavor can carry a whole sense of place. Browse the [State Exclusive line](/shop/vapes) where available, or [find a licensed retailer](/locations) near you.`,
    status: "published",
    publishedAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-08-02T21:00:00.000Z",
  },
  {
    slug: "how-we-publish-coas",
    title: "How we publish certificates of analysis",
    excerpt:
      "Every active SKU links to lab results so potency is never a surprise - what a COA covers, how to look one up, and how validation ties in.",
    body: `Quick Answer: A certificate of analysis (COA) is a third-party lab report for a cannabis batch. DIME publishes potency and related batch data on [Lab Results](/lab-results) so you can check THC, CBD, and other markers before you buy or after you open a pack.

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.

### Key takeaways

Transparency is part of the product. Each active batch carries potency metadata on the storefront and a COA path on Lab Results. You can search by SKU or product name. Validation confirms authenticity and unlocks warranty and rewards. Live COA hosts can swap in without a storefront redesign.

### What a COA is (and is not)

A COA is a lab document for a specific batch - not a marketing claim and not medical advice. It typically lists cannabinoids such as THC and CBD, and may include other tested analytes depending on the lab and market rules. It does not guarantee how any person will feel. Always buy from licensed retailers and follow local law.

### Why DIME publishes lab results

Potency should not be a surprise at the checkout or in the drawer. DIME surfaces batch-linked data so shoppers can compare lines - Signature, Live Reserve, Rosin, State Exclusives, and more - with real numbers instead of guesswork. Packaging may also carry a scannable or printed COA reference; the website is the durable lookup when a sticker wears off.

### How to look up a batch

Open [Lab Results](/lab-results). Search by SKU from the box or by product name. Match the batch identifiers on the package when they are present. If results are still loading from the live host, try again shortly - records swap in without changing the Lab Results page layout.

### What to read first on a report

Start with total THC and CBD (or the labels your market requires). Note the batch or lot ID and the test date. If terpene data is present, use it for aroma and flavor expectations - not as medical guidance. When numbers differ slightly from a product card, prefer the batch COA tied to the package in your hand.

### COAs and product validation

Lab results answer "what was tested." [Validate](/validate) answers "is this pack authentic." Scratch the code on the package, enter it on Validate, and unlock limited warranty, loyalty points, and early access where offered. Use both: COA for potency context, validation for authenticity.

### Shopping with potency in mind

If you care more about strength bands than strain names, browse the [shop](/shop) with potency filters where available, then confirm the batch on Lab Results. For solventless-style lineups, see [rosin](/shop/vapes/rosin). For regional drops, read how [State Exclusives](/blog/how-dime-state-exclusives-capture-a-place) are built.

### Hardware that respects the oil

Cleaner hardware helps you taste what the lab measured. DIME engineers tanks and batteries in-house - dual ceramic plates, zero-waste atomizer goals, and USB-C batteries. Learn the full story in [Built to Beat Leaks](/blog/built-to-beat-leaks-the-dime-hardware-story).

### Frequently asked questions

### Where do I find DIME lab results?

Use [Lab Results](/lab-results) on this site. Search by SKU or product name. Licensed packaging may also point to a batch COA.

### Is a COA the same as product validation?

No. A COA is lab data for a batch. Validation confirms the package code is authentic and can unlock warranty and rewards.

### Do all products have the same tests?

Markets and product types can require different panels. Always read the report for the batch you purchased.

### What if I cannot find my SKU?

Double-check spelling, try the product name, or contact support with a clear photo of the label. Retailers sometimes use local menu aliases that differ from the brand SKU.

### Can COAs change after I buy?

A COA is tied to a batch. New batches get new reports. Keep the package lot ID so you can look up the correct document later.

### Keep digging

Browse the [catalog](/shop), confirm authenticity at [Validate](/validate), earn on [Rewards](/rewards), or [find a licensed retailer](/locations). For coin-curious readers who landed here by accident, see [How many dimes in a roll?](/blog/how-many-dimes-in-a-roll).`,
    status: "published",
    publishedAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-08-02T21:30:00.000Z",
  },
  {
    slug: "shopping-by-potency",
    title: "Shopping by potency, not just strain",
    excerpt:
      "Why DIME treats THC bands as first-class discovery - how to read potency on cards and COAs, and when flavor or format should lead instead.",
    body: `Quick Answer: Potency (often shown as THC percentage or milligrams) describes cannabinoid strength for a batch or serving. Strain names describe genetics and marketing identity. Shopping by potency bands helps you compare similar formats faster - then confirm the batch on [Lab Results](/lab-results).

This article is for educational purposes only. It is not medical advice and makes no health or safety guarantees. DIME products are intended for adults 21 and older in legal markets.

### Key takeaways

Strain names alone do not tell you strength. DIME product cards and filters treat THC bands as first-class discovery. Always match the package batch to its COA. Format matters: a 1000mg vape tank is not the same as an edible serving. Start low and go slow with any new product. Validate authenticity after you buy.

### Why potency-first shopping exists

Two products can share a familiar strain nickname and still land in different potency bands. Batch variation, extraction method, and fill weight all change what ends up in the device or edible. Potency-first browsing puts strength next to name so you are not guessing from a label vibe alone.

### How to read a DIME product card

Look for THC (and CBD when listed) on the card, then open the product for variant details. Prefer the batch COA when the package is in hand - card copy can summarize a typical range while the COA is the batch record. Use [Lab Results](/lab-results) with the SKU from the box.

### Potency vs. terpenes vs. effects

THC and CBD are cannabinoid numbers. Terpenes shape aroma and flavor. Neither is a prescription for how you will feel. If you shop for taste, read tasting notes and State Exclusive stories. If you shop for strength bands, filter by potency first, then narrow by line - Signature, Live Reserve, Rosin, Balanced, or Collaborations.

### Format changes the math

Vape tanks list oil capacity and potency metadata differently from gummies or softgels. An edible serving size is not interchangeable with a vape percentage. Compare like with like: vape to vape, edible to edible. When in doubt, read the serving panel and the COA, not a social media screenshot.

### A simple path through the catalog

Open [Shop](/shop). Filter or sort toward the potency band you want when filters are available. Shortlist two or three SKUs. Check Lab Results for each. Pick hardware or format you already trust - or learn why DIME builds its own tanks in [the hardware story](/blog/built-to-beat-leaks-the-dime-hardware-story). Prefer solventless-style options? Start with [rosin](/shop/vapes/rosin).

### Regional flavor without guessing strength

State Exclusives celebrate place through flavor. Still verify potency on the card and COA - a tribute profile is not a substitute for batch numbers. Read [How DIME State Exclusives capture a place](/blog/how-dime-state-exclusives-capture-a-place) for the flavor side of the story.

### After you buy: validate and track

Scratch and [validate](/validate) the pack to confirm authenticity and unlock limited warranty plus rewards where offered. Keep the lot ID if you want to revisit the COA later. Members can watch [Rewards](/rewards) for points and early access.

### Frequently asked questions

### Is higher THC always better?

No. Higher numbers are not automatically a better session. Format, tolerance, setting, and personal preference matter. This is not medical advice.

### Why does the card differ slightly from the COA?

Cards may show representative or rounded values. The COA is batch-specific. Trust the report tied to your package lot.

### Can I shop by CBD or balanced ratios?

Yes where those products are listed. Look for Balanced or CBD-forward SKUs in the catalog and confirm on Lab Results.

### Do prerolls show potency the same way as vapes?

Labels and markets differ. Read the package panel for the product type you bought, and use Lab Results when a SKU is published.

### What if my market does not sell online?

Use [Find DIME](/locations) for licensed retailers, then ask the budtender for the batch COA or check Lab Results with the SKU.

### Keep exploring

Learn how we [publish COAs](/blog/how-we-publish-coas), browse the [full catalog](/shop), or ask the [AI Assistant](/assistant) for navigation help. Always purchase from licensed channels and keep products away from children.`,
    status: "published",
    publishedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-08-02T21:30:00.000Z",
  },
  {
    slug: "how-many-dimes-in-a-roll",
    title: "How many dimes in a roll?",
    excerpt:
      "A standard U.S. dime roll holds 50 dimes ($5 face value). Here's how coin rolls work - plus how to find DIME Industries products nearby.",
    body: `Quick Answer: A standard United States dime roll contains 50 dimes, equal to $5.00 in face value. Banks, armored carriers, and coin machines package circulating dimes in paper or plastic rolls of 50 so tellers and businesses can count change quickly without sorting loose coins by hand.

### How many dimes are in a standard roll?

In the United States, a full roll of dimes is standardized at 50 coins. That convention is used by banks, credit unions, and retail cash offices nationwide. If you open a roll of dimes from a bank drawer or a wrapped coin order, you should find fifty Roosevelt dimes (or older Winged Liberty dimes still in circulation) unless the roll was short-filled or broken open earlier.

The same packaging logic applies to other U.S. denominations, each with its own count: pennies typically roll at 50, nickels at 40, quarters at 40, and half dollars at 20. Knowing the dime count helps when you are verifying a cash drawer, preparing a deposit, or teaching kids how coin rolls work.

### How much is a roll of dimes worth?

Fifty dimes at ten cents each equal $5.00 in face value. That number does not change with the metal melt value of circulating clad coins - for everyday banking and retail, face value is what matters. Collectors sometimes pay a premium for uncirculated bank-wrapped rolls or for older silver dimes dated 1964 and earlier, but a modern circulating roll is still worth five dollars in spendable change.

If you are depositing coins, most banks credit the face value after counting. Some branches charge a fee for non-customers or require coins to be rolled before acceptance. Machine counters at grocery stores or coin kiosks may take a percentage fee, so a $5 roll might return slightly less in cash or store credit after fees.

### What does a dime roll look like?

Traditional paper coin wraps are printed with the denomination, the piece count, and often the dollar total. A dime wrap typically shows "50 dimes" and "$5.00." Plastic machine wraps from coin sorters are clear or tinted tubes with similar labeling. Either way, the sealed roll should feel dense and even; a soft or rattling roll can mean missing coins or an incomplete fill.

Dimes are the thinnest commonly rolled U.S. coin, so a complete roll is shorter than a roll of quarters even though quarters often hold 40 pieces. That size difference is one reason tellers keep denomination-specific trays and color-coded wrappers.

### Bank rolls vs. machine-wrapped rolls

Bank (or "hand") wraps are paper sleeves filled by tellers or customers and crimped at the ends. Machine-wrapped rolls come from high-speed sorters used by banks and armored services. Both should contain 50 dimes when filled to standard. Machine wraps are usually more uniform; customer-filled wraps occasionally come up short, which is why many cashiers crack a roll and spot-count before putting it in a till.

Neither wrap type guarantees collectible condition. Circulating rolls mix dates and mint marks. If you care about numismatics, look for special Mint or proof products sold as collectibles - those are not the same as everyday change rolls.

### Why people ask about dime rolls

Searchers ask "how many dimes in a roll" when balancing registers, teaching money math, preparing bank deposits, or settling a friendly debate. The answer is short and stable: fifty coins, five dollars. Keeping that fact handy avoids recounting every time a roll hits the counter.

The question also shows up alongside brand curiosity. People who know DIME Industries - the cannabis brand behind award-winning vapes and edibles - sometimes land on the coin query first, then look for the company. Both meanings of "dime" can coexist as long as the coin fact stays clear and product information stays compliant and separate.

### From coin rolls to DIME Industries

DIME Industries is a licensed cannabis brand (est. 2016) known for engineered hardware and lab-tested extracts. If you came here for the coin answer, you already have it: 50 dimes per roll. If you are looking for DIME products, start with [DIME carts and vapes](/shop/vapes), browse [rosin](/shop/vapes/rosin) when you want solventless-style lineups, or [find a licensed retailer near you](/locations). Learn more about the brand on [About DIME Industries](/about).

Always buy cannabis products from licensed retailers in legal markets, validate authenticity when prompted, and keep products away from children and pets.

This article is for educational purposes only. It is not medical, financial, or legal advice. DIME cannabis products are intended for adults 21 and older, or qualifying medical patients, in licensed markets. Keep all cannabis products out of reach of children.

### Frequently asked questions

### How many dimes are in a roll of dimes?

Fifty. A standard U.S. dime roll contains 50 coins.

### How much money is in a roll of dimes?

$5.00 in face value (50 × $0.10).

### Are dime rolls the same at every bank?

Yes for face-value packaging: banks use the 50-coin standard. Fees, buyback rules, and whether they accept loose coins vary by institution.

### Do Canadian or other countries use the same dime-roll count?

No. This article covers United States circulating coin rolls. Other countries set their own roll sizes.

### Is this article about DIME cannabis products?

The primary answer is about U.S. coin rolls. DIME Industries product links are optional next steps for readers looking for the brand - for adults 21+ (or qualifying patients) in legal markets only.`,
    status: "published",
    publishedAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-03T10:00:00.000Z",
  },
  {
    slug: "what-is-a-dime-cart",
    title: "What is a Dime cart?",
    excerpt:
      "A Dime cart is a DIME Industries cannabis vape cartridge — tanks, 510 carts, and all-in-ones across Signature, Live Reserve, Rosin, and more.",
    body: `Quick Answer: A Dime cart is a DIME Industries cannabis vape cartridge — typically a 510-thread tank or proprietary all-in-one filled with lab-tested extract. Customers use “Dime cart” as shorthand for the brand’s carts and disposables sold through licensed retailers in legal markets.

### What does “Dime cart” mean?

“Dime cart” is search language for DIME Industries vape cartridges. It usually means a filled tank or cartridge from the brand, not a generic empty cart. DIME engineers its own hardware — including leak-resistant tanks and ceramic heating — then fills devices with line-specific extracts such as Signature, Live Reserve, Rosin, Balanced, State Exclusive, and Collabs.

If you hear someone say they bought a Dime cart, they almost always mean an authentic DIME Industries product purchased from a licensed dispensary or authorized online channel where available.

### What formats do Dime carts come in?

DIME carts show up in a few shopper-friendly formats:

510-thread tanks and cartridges that pair with a compatible battery (DIME recommends its own batteries for full performance). All-in-one disposables that combine extract and a rechargeable battery in one device. Line-specific builds across Signature, Live Reserve, Rosin, and other collections.

Browse the full set under [DIME carts and vapes](/shop/vapes). Hardware and batteries live under [Accessories](/shop/accessories) where listed for your market.

### Signature vs Live Reserve vs Rosin (overview)

Signature is the everyday flagship experience — potent distillate-forward formulas with terpene enhancement for flavor. Live Reserve leans strain-forward with high-terpene extract and melted diamonds. Rosin targets solventless-style extract fans who want a true-to-flower profile. For a deeper split, read [Signature vs Live Reserve](/blog/signature-vs-live-reserve) and [What is DIME Live Reserve?](/blog/dime-live-reserve-explained), or shop [Rosin vapes](/shop/vapes/rosin) directly.

### How to know a Dime cart is authentic

Buy only from licensed retailers. Then [validate your product](/validate) on the official tool and check [lab results](/lab-results) when a COA path is published for your SKU. Packaging that fails validation, “too cheap” online sellers, and missing batch information are red flags. See [How to spot fake Dime carts](/blog/how-to-spot-fake-dime-carts) for a full checklist.

### Where to buy Dime carts near you

Use [Find DIME](/locations) to locate authorized retailers by state. In markets with online shopping, start from the [shop](/shop) after age verification. Prefer licensed channels every time — authenticity and compliance both depend on it.

### Cart vs disposable: which should you get?

If you already own a battery and want reusable hardware, a cart/tank is usually the better fit. If you want everything in one device, choose a DIME all-in-one disposable. Full comparison: [Dime cart vs disposable](/blog/dime-cart-vs-disposable).

This article is for educational purposes only. It is not medical advice. DIME cannabis products are intended for adults 21 and older, or qualifying medical patients, in licensed markets. Keep products out of reach of children.

### Frequently asked questions

### What is a Dime cart?

A Dime cart is a DIME Industries cannabis vape cartridge or tank — often searched as “dime carts” — sold through licensed retailers.

### Are Dime carts the same as Dime disposables?

Not always. Carts/tanks usually need a battery. All-in-one disposables include the battery. Both can carry DIME extracts.

### Do Dime carts work on any 510 battery?

Many DIME tanks use a universal 510 thread, but DIME recommends its own batteries for intended performance. Check the product page for your SKU.

### How do I verify a Dime cart is real?

Purchase from a licensed retailer, then use [Validate](/validate) and review [Lab Results](/lab-results) when available.`,
    status: "published",
    publishedAt: "2026-08-03T00:00:00.000Z",
    updatedAt: "2026-08-03T00:00:00.000Z",
  },
  {
    slug: "dime-cart-vs-disposable",
    title: "Dime cart vs disposable: which should you buy?",
    excerpt:
      "Dime carts pair with a battery; Dime all-in-one disposables include one. Here’s how to choose by convenience, cost, and line.",
    body: `Quick Answer: A Dime cart (tank/cartridge) pairs with a compatible battery for reusable hardware. A Dime disposable / all-in-one combines extract and battery in one device. Choose a cart if you already own a battery and want flexibility; choose an all-in-one for convenience and built-in heat settings.

### What is a Dime cart?

A Dime cart is a filled DIME Industries cartridge or tank. Most shoppers mean a 510-thread or DIME-engineered tank that attaches to a battery. You control the battery, swap flavors more easily over time, and reuse hardware. Learn the definition in [What is a Dime cart?](/blog/what-is-a-dime-cart).

### What is a Dime disposable / all-in-one?

A DIME all-in-one (often searched as “dime disposable”) ships ready to use: extract plus rechargeable battery in one body, typically with heat presets designed for that fill. No separate battery purchase required. When the oil is done, the device is finished as a unit — convenience first.

### Side-by-side comparison

| Factor | Dime cart (tank) | All-in-one disposable |
| --- | --- | --- |
| Battery | Needs a compatible battery | Included in the device |
| Flexibility | Swap tanks / flavors on one battery | Grab-and-go single unit |
| Best for | Reusable hardware owners | Travel and convenience |
| When oil ends | Replace or refill the cart path | Device is finished as a unit |
| Shop | [DIME carts & vapes](/shop/vapes) | [Disposables guide](/shop/vapes/disposables) |

### Who should buy which?

Choose a cart if you already have a DIME or compatible 510 battery, want to stock multiple tanks, or prefer reusable hardware. Choose an all-in-one if you travel light, gift a ready device, or do not want to manage a separate battery. New to the brand? Start with the format your licensed retailer stocks most often, then explore [DIME vapes](/shop/vapes) or the [dime disposable / all-in-one guide](/shop/vapes/disposables).

### Flavor and line availability

Availability varies by state and retailer. Browse [Signature](/shop/vapes/signature), [Live Reserve](/shop/vapes/live-reserve), and [Rosin](/shop/vapes/rosin), then confirm jurisdiction after age verification. Batteries and related hardware: [Accessories](/shop/accessories). Retail finder: [Find DIME](/locations). For licensed-market consumer resources, see the [California Department of Cannabis Control](https://cannabis.ca.gov/) and the [Massachusetts Cannabis Control Commission](https://masscannabiscontrol.com/).

This article is for educational purposes only. It is not medical advice. Adults 21+ or qualifying patients in licensed markets only.

### Frequently asked questions

### Is a Dime all-in-one the same as a Dime cart?

No. An all-in-one includes the battery. A cart/tank usually attaches to a separate battery.

### Can I refill a Dime disposable?

DIME all-in-ones are designed as complete devices for the filled oil — follow package guidance and buy a new SKU when empty.

### Which format is more potent?

Potency depends on the extract and batch, not only the format. Compare labels and [lab results](/lab-results) for the SKU you buy.

### Where should I buy either format?

Only from licensed retailers or authorized online channels. Use [Find DIME](/locations) and [Validate](/validate).`,
    status: "published",
    publishedAt: "2026-08-03T00:10:00.000Z",
    updatedAt: "2026-08-03T00:10:00.000Z",
  },
  {
    slug: "dime-live-reserve-explained",
    title: "What is DIME Live Reserve?",
    excerpt:
      "Live Reserve is DIME’s strain-forward vape line using high-terpene extract and melted diamonds — not identical to every “live resin” menu label.",
    body: `Quick Answer: DIME Live Reserve is a vape line built for strain-forward flavor and potency. It uses a mixture of high-terpene extract and melted diamonds. That is not automatically the same as every product a menu simply labels “live resin.” Shop Live Reserve carts and all-in-ones where licensed.

### What is Live Reserve?

Live Reserve is one of DIME Industries’ core vape collections. The line is positioned for customers who want bold, strain-expressive flavor with the potency DIME is known for. Official product language describes Live Reserve as a mixture of high-terpene extract and melted diamonds — retaining natural flavor character while delivering a strong session.

Browse the line at [Live Reserve vapes](/shop/vapes/live-reserve).

### Live Reserve vs Signature

Signature is the flagship distillate-forward experience with terpene enhancement for consistent flavor. Live Reserve emphasizes high-terpene extract plus melted diamonds for a more strain-led profile. Neither is “better” in the abstract — they serve different preferences. Full breakdown: [Signature vs Live Reserve](/blog/signature-vs-live-reserve).

### Live Reserve vs “live resin” on menus

Retail menus often use “live resin” loosely. DIME’s Live Reserve naming and fill method are specific. Always read the package, line name, and [COA / lab results](/lab-results) for the batch you buy instead of assuming every “live resin” sticker matches Live Reserve. For general extract terminology, see [Wikipedia’s live resin overview](https://en.wikipedia.org/wiki/Live_resin). If a budtender lists a DIME Live Reserve SKU, match it to the DIME line page rather than a generic category alone.

### Who is Live Reserve for?

Flavor chasers, customers who already like strain-forward extracts, and shoppers comparing DIME lines beyond everyday Signature. If you want solventless-style extracts, also look at [Rosin](/shop/vapes/rosin). New to DIME carts overall? Start with [What is a Dime cart?](/blog/what-is-a-dime-cart).

### How to shop Live Reserve

Open [Live Reserve](/shop/vapes/live-reserve) after age verification, filter by strain and format, and confirm your jurisdiction. Prefer [licensed retailers](/locations) when shopping in person. Validate authenticity with [Validate](/validate) after purchase when prompted.

This article is for educational purposes only. It is not medical advice. Adults 21+ or qualifying patients in licensed markets only.

### Frequently asked questions

### What is DIME Live Reserve?

A DIME vape line using high-terpene extract and melted diamonds for strain-forward flavor and potency.

### Is Live Reserve the same as live resin?

Not necessarily. Menus use “live resin” broadly. Trust the DIME line name, package, and COA for the SKU you buy.

### Does Live Reserve come as a cart and disposable?

Yes where listed — tanks/carts and all-in-ones can both appear in Live Reserve. Check the catalog for your market.

### Where can I buy Live Reserve near me?

Use [Find DIME](/locations) or shop online where DIME sells in your state.`,
    status: "published",
    publishedAt: "2026-08-03T00:20:00.000Z",
    updatedAt: "2026-08-03T00:20:00.000Z",
  },
  {
    slug: "signature-vs-live-reserve",
    title: "DIME Signature vs Live Reserve",
    excerpt:
      "Signature is distillate-forward with terpene enhancement; Live Reserve uses high-terpene extract and melted diamonds. Here’s how to choose.",
    body: `Quick Answer: Signature focuses on potent, flavorful distillate experiences with terpene enhancement. Live Reserve emphasizes high-terpene extract with melted diamonds for a more strain-expressive profile. Both use DIME hardware — pick based on flavor intensity and extract preference.

### Quick comparison

| Topic | Signature | Live Reserve |
| --- | --- | --- |
| Extract focus | Distillate-forward with terpene enhancement | High-terpene extract + melted diamonds |
| Flavor character | Broad everyday appeal | Strain-expressive |
| Hardware | DIME-engineered carts / AIOs | DIME-engineered carts / AIOs |
| Shop | [Signature](/shop/vapes/signature) | [Live Reserve](/shop/vapes/live-reserve) |

### What is Signature?

Signature is DIME’s flagship line for many shoppers — pure, potent live-resin-infused distillate with cannabis-derived and fruit-derived terpenes reintroduced for flavor, per brand FAQ language. Shop [Signature vapes](/shop/vapes/signature).

### What is Live Reserve?

Live Reserve mixes high-terpene extract and melted diamonds to keep a natural strain flavor profile while staying potent. Deeper explainer: [What is DIME Live Reserve?](/blog/dime-live-reserve-explained). Shop [Live Reserve](/shop/vapes/live-reserve).

### Which should you choose?

Choose Signature if you want a reliable flagship experience and wide flavor availability. Choose Live Reserve if you care most about strain-led terpene character. Still unsure? Ask your licensed retailer which SKUs they move most, then confirm potency on the label and [Lab Results](/lab-results).

### Where Rosin fits

Rosin is a separate lane for solventless-style extracts. If that is your priority, go to [Rosin vapes](/shop/vapes/rosin) rather than treating Rosin as a Signature or Live Reserve substitute. Cart format basics: [What is a Dime cart?](/blog/what-is-a-dime-cart) and [Cart vs disposable](/blog/dime-cart-vs-disposable).

This article is for educational purposes only. It is not medical advice. Adults 21+ or qualifying patients in licensed markets only.

### Frequently asked questions

### Is Live Reserve stronger than Signature?

Potency varies by batch and SKU. Compare the package panel and COA instead of assuming one line is always higher.

### Can I get both lines as disposables?

Often yes where the market lists all-in-ones for each line. Check [Shop vapes](/shop/vapes).

### What does “live resin infused distillate” mean for Signature?

Signature uses distillate with terpenes reintroduced for flavor — see official FAQ language and your batch COA for exact composition.

### Where do I buy either line near me?

[Find DIME](/locations) or shop online where available after age verification.`,
    status: "published",
    publishedAt: "2026-08-03T00:30:00.000Z",
    updatedAt: "2026-08-03T00:30:00.000Z",
  },
  {
    slug: "how-to-spot-fake-dime-carts",
    title: "How to spot fake Dime carts",
    excerpt:
      "Buy DIME only from licensed retailers, validate on the official tool, and treat failed validation or rock-bottom online prices as red flags.",
    body: `Quick Answer: Buy DIME only from licensed retailers, then validate your product on the official Validate tool. Avoid “too cheap” online sellers, missing batch or COA paths, and packaging that fails validation. If it does not validate, treat it as potentially fraudulent.

### Why counterfeits exist

Popular hardware brands attract copycats. Fake carts can misuse logos, reuse packaging tropes, or sell through unofficial websites. Protecting yourself is mostly about channel and verification — not guessing from photos alone.

### Buy licensed only

Start with [Find DIME](/locations) or the official [shop](/shop) in markets that sell online. Licensed dispensaries and authorized channels are the baseline. Social-media sellers, unlabeled delivery accounts, and “no ID” websites are not legitimate paths for DIME products.

### How to validate a DIME product

After a licensed purchase, use [Validate](/validate) with the information on your package. Validation supports authenticity checks and can activate warranty pathways described by the brand. Keep your receipt and retailer details if you need support.

### Packaging and price red flags

Prices far below local licensed menus without a clear promotion. Sellers who cannot name a licensed shop. Packaging that will not validate. Missing or unverifiable lab information when you expect a [COA path](/lab-results). Spelling errors or low-quality print that diverge from products you have bought before at licensed stores.

### What to do if validation fails

Do not assume the product is authentic. Contact the licensed retailer with your receipt, and reach out through official [Contact](/contact) channels with package details. Prefer replacement through licensed processes rather than continuing to use an unverified device.

### Related reading

Hardware story: [Built to beat leaks](/blog/built-to-beat-leaks-the-dime-hardware-story). Product basics: [What is a Dime cart?](/blog/what-is-a-dime-cart). Always cross-check [FAQ](/faq) for authenticity guidance.

This article is for educational purposes only. It is not medical, legal, or safety advice beyond directing you to licensed channels and official validation. Adults 21+ or qualifying patients in licensed markets only. Keep products away from children.

### Frequently asked questions

### Are dime carts real if I bought them online?

Only if the site is an authorized DIME channel for your state. Many third-party “online carts” sites are not legitimate.

### How do I check authenticity?

Use [Validate](/validate) after buying from a licensed retailer. Review [Lab Results](/lab-results) when your SKU is published.

### What if my product does not validate?

Treat it as potentially fraudulent. Contact the licensed retailer and official support with your receipt and package details.

### Where should I buy to avoid fakes?

Licensed dispensaries and authorized DIME online shopping where available — start at [Find DIME](/locations).`,
    status: "published",
    publishedAt: "2026-08-03T00:40:00.000Z",
    updatedAt: "2026-08-03T00:40:00.000Z",
  },
  {
    slug: "how-to-use-a-dime-cart",
    title: "How to use a Dime cart",
    excerpt:
      "Attach a DIME or compatible 510 battery, start on a mid heat setting, take slow draws, and validate authenticity after a licensed purchase.",
    body: `Quick Answer: To use a Dime cart, buy from a licensed retailer, attach the filled tank to a DIME or compatible 510 battery, start on a mid heat setting, take slow steady draws, and store upright. Confirm authenticity on [Validate](/validate) and check your batch on [Lab Results](/lab-results).

### What you need before you start

You need an authentic DIME cart or tank from a licensed seller, a charged compatible battery (DIME recommends its own batteries for full performance), and a clean 510 connection. If you bought an all-in-one disposable instead, skip the separate battery — see [Cart vs disposable](/blog/dime-cart-vs-disposable).

### Step-by-step: how to use a Dime cart

| Step | Action |
| --- | --- |
| 1 | Confirm the pack is from a licensed retailer and scratch/validate the code on [Validate](/validate). |
| 2 | Charge your DIME or compatible 510 battery fully before the first session. |
| 3 | Thread the cart on straight — snug, not overtightened — so the contacts seat cleanly. |
| 4 | Start on a mid heat preset; raise only if vapor is thin, lower if flavor tastes harsh. |
| 5 | Take slow draws. Avoid chain-hitting that overheats thick oil. |
| 6 | Store upright with the battery off between sessions. |

### How do I charge a DIME battery?

Use the USB-C path your DIME battery supports and the cable that ships with it when available. Do not leave batteries on unsafe chargers overnight. If the device will not power on, confirm charge, connection, and that the cart is seated — then contact support through licensed purchase channels if hardware fails after validation.

### Why does my cart taste burnt or weak?

Common causes: heat set too high, empty or nearly empty tank, poor connection, or counterfeit hardware. Drop heat, check fill level, reseat the cart, and re-validate. Prefer licensed stock and official [Lab Results](/lab-results) for the batch you own.

### Cart vs all-in-one reminder

Carts reuse a battery across flavors. All-in-ones include the battery. Both can carry Signature, Live Reserve, or Rosin fills where your market lists them — browse [DIME carts & vapes](/shop/vapes).

### Frequently asked questions

### Do I need a DIME battery for a Dime cart?

DIME tanks use a universal 510 thread that fits many batteries, but DIME recommends its own battery for full performance with ceramic heating and presets.

### Can I use a Dime cart while charging?

Follow the instructions for your specific battery or all-in-one. When unsure, finish charging before a session.

### Where should I buy Dime carts?

Licensed retailers and authorized online checkout where available — start at [Find DIME](/locations). Avoid unverified social sellers.

This article is for educational purposes only. It is not medical advice. DIME products are for adults 21+ or qualifying patients in licensed markets. Keep products away from children.`,
    status: "published",
    publishedAt: "2026-08-03T12:00:00.000Z",
    updatedAt: "2026-08-03T12:00:00.000Z",
  },
];

const DEFAULT_BANNER: HomepageBanner = {
  enabled: true,
  headline: "Elevate your experience",
  body: "Explore award-winning DIME vapes, edibles, and prerolls - lab-tested and ready to shop.",
  ctaLabel: "Shop now",
  ctaHref: "/shop",
};

type CmsJar = {
  pages: CmsPage[];
  posts: BlogPost[];
  banner: HomepageBanner;
  layout: HomepageLayout;
};

function mergeSeedPosts(posts: BlogPost[]): BlogPost[] {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  for (const seed of DEFAULT_POSTS) {
    const current = bySlug.get(seed.slug);
    if (!current || seed.updatedAt > current.updatedAt) {
      bySlug.set(seed.slug, seed);
    }
  }
  return Array.from(bySlug.values());
}

function emptyJar(): CmsJar {
  return {
    pages: DEFAULT_PAGES,
    posts: DEFAULT_POSTS,
    banner: DEFAULT_BANNER,
    layout: DEFAULT_HOMEPAGE_LAYOUT,
  };
}

async function readJar(): Promise<CmsJar> {
  const store = await cookies();
  const raw = store.get(CMS_COOKIE)?.value;
  if (!raw) {
    return emptyJar();
  }
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) {
      return emptyJar();
    }
    return {
      pages: parsed.data.pages.length ? parsed.data.pages : DEFAULT_PAGES,
      posts: mergeSeedPosts(parsed.data.posts.length ? parsed.data.posts : DEFAULT_POSTS),
      banner: parsed.data.banner,
      layout: normalizeHomepageLayout(parsed.data.layout ?? DEFAULT_HOMEPAGE_LAYOUT),
    };
  } catch {
    return emptyJar();
  }
}

async function writeJar(jar: CmsJar): Promise<void> {
  const store = await cookies();
  store.set(CMS_COOKIE, encodeURIComponent(JSON.stringify({ ...jar, seeded: true })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Deduplicate seed across parallel static/ISR renders (one seed per process). */
let dbCmsReady: Promise<boolean> | null = null;

async function useDbCms(): Promise<boolean> {
  // Static generation must not wait on Postgres - parallel CMS pages were
  // exhausting the pool and hitting Next's 60s page timeout on Vercel.
  if (isProductionBuild()) return false;

  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (!isGrowthDatabaseMode()) return false;

  if (!dbCmsReady) {
    dbCmsReady = (async () => {
      const { dbSeedCmsIfEmpty } = await import("./cms-db");
      await withTimeout(
        dbSeedCmsIfEmpty(DEFAULT_PAGES, DEFAULT_POSTS, DEFAULT_BANNER, DEFAULT_HOMEPAGE_LAYOUT),
        CMS_DB_TIMEOUT_MS,
        "seed"
      );
      return true;
    })().catch((err) => {
      console.error("[cms] database unavailable, falling back to defaults", err);
      dbCmsReady = null;
      return false;
    });
  }
  return dbCmsReady;
}

function publishedOnly<T extends { status: string }>(items: T[], includeDrafts: boolean): T[] {
  return includeDrafts ? items : items.filter((p) => p.status === "published");
}

export async function listCmsPages(includeDrafts = false): Promise<CmsPage[]> {
  return cachedListCmsPages(includeDrafts);
}

const cachedListCmsPages = cache(async (includeDrafts: boolean): Promise<CmsPage[]> => {
  if (isProductionBuild()) {
    return publishedOnly(DEFAULT_PAGES, includeDrafts);
  }
  if (await useDbCms()) {
    try {
      const { dbListCmsPages } = await import("./cms-db");
      return publishedOnly(
        await withTimeout(dbListCmsPages(), CMS_DB_TIMEOUT_MS, "list pages"),
        includeDrafts
      );
    } catch (err) {
      console.error("[cms] list pages failed, using defaults", err);
      return publishedOnly(DEFAULT_PAGES, includeDrafts);
    }
  }
  const { pages } = await readJar();
  return publishedOnly(pages, includeDrafts);
});

export async function getCmsPage(slug: string, includeDrafts = false): Promise<CmsPage | null> {
  const pages = await listCmsPages(includeDrafts);
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function upsertCmsPage(page: CmsPage): Promise<void> {
  if (await useDbCms()) {
    const { dbUpsertCmsPage } = await import("./cms-db");
    await dbUpsertCmsPage(page);
    return;
  }
  const jar = await readJar();
  const idx = jar.pages.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) jar.pages[idx] = page;
  else jar.pages.push(page);
  await writeJar(jar);
}

export async function listBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  return cachedListBlogPosts(includeDrafts);
}

const cachedListBlogPosts = cache(async (includeDrafts: boolean): Promise<BlogPost[]> => {
  const sortPosts = (posts: BlogPost[]) =>
    publishedOnly(posts, includeDrafts).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  if (isProductionBuild()) {
    return sortPosts(DEFAULT_POSTS);
  }
  if (await useDbCms()) {
    try {
      const { dbListBlogPosts } = await import("./cms-db");
      const rows = await withTimeout(dbListBlogPosts(), CMS_DB_TIMEOUT_MS, "list posts");
      return sortPosts(mergeSeedPosts(rows));
    } catch (err) {
      console.error("[cms] list posts failed, using defaults", err);
      return sortPosts(DEFAULT_POSTS);
    }
  }
  const { posts } = await readJar();
  return sortPosts(posts);
});

export async function getBlogPost(slug: string, includeDrafts = false): Promise<BlogPost | null> {
  const posts = await listBlogPosts(includeDrafts);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function upsertBlogPost(post: BlogPost): Promise<void> {
  if (await useDbCms()) {
    const { dbUpsertBlogPost } = await import("./cms-db");
    await dbUpsertBlogPost(post);
    return;
  }
  const jar = await readJar();
  const idx = jar.posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) jar.posts[idx] = post;
  else jar.posts.push(post);
  await writeJar(jar);
}

export async function getHomepageBanner(): Promise<HomepageBanner> {
  if (isProductionBuild()) {
    return DEFAULT_BANNER;
  }
  if (await useDbCms()) {
    try {
      const { dbGetBanner } = await import("./cms-db");
      return (await dbGetBanner()) ?? DEFAULT_BANNER;
    } catch (err) {
      console.error("[cms] banner failed, using defaults", err);
      return DEFAULT_BANNER;
    }
  }
  return (await readJar()).banner;
}

export async function saveHomepageBanner(banner: HomepageBanner): Promise<void> {
  if (await useDbCms()) {
    const { dbSaveBanner } = await import("./cms-db");
    await dbSaveBanner(banner);
    return;
  }
  const jar = await readJar();
  jar.banner = banner;
  await writeJar(jar);
}

export async function getHomepageLayout(): Promise<HomepageLayout> {
  if (isProductionBuild()) {
    return DEFAULT_HOMEPAGE_LAYOUT;
  }
  if (await useDbCms()) {
    try {
      const { dbGetHomepageLayout } = await import("./cms-db");
      const fromDb = await dbGetHomepageLayout();
      return fromDb ? normalizeHomepageLayout(fromDb) : DEFAULT_HOMEPAGE_LAYOUT;
    } catch (err) {
      console.error("[cms] homepage layout failed, using defaults", err);
      return DEFAULT_HOMEPAGE_LAYOUT;
    }
  }
  return (await readJar()).layout;
}

export async function saveHomepageLayout(layout: HomepageLayout): Promise<void> {
  const normalized = normalizeHomepageLayout(layout);
  if (await useDbCms()) {
    const { dbSaveHomepageLayout } = await import("./cms-db");
    await dbSaveHomepageLayout(normalized);
    return;
  }
  const jar = await readJar();
  jar.layout = normalized;
  await writeJar(jar);
}
