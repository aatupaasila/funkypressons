// Countries Stripe Checkout can ship to (ISO 3166-1 alpha-2), minus a few
// uninhabited or placeholder codes. Names come from the browser/Node locale data.
const codes =
  "AD AE AF AG AI AL AM AO AR AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PR PS PT PY QA RE RO RS RU RW SA SB SC SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VN VU WF WS XK YE YT ZA ZM ZW".split(
    " ",
  );

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export const countryName = (code: string) => (code === "XK" ? "Kosovo" : (displayNames.of(code) ?? code));

export const countries = codes.map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));

export const isCountryCode = (value: unknown): value is string => typeof value === "string" && codes.includes(value);
