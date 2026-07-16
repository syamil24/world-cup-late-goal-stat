/** Map World Cup team names → ISO 3166-1 alpha-2 (flagcdn). */
const TEAM_TO_CODE: Record<string, string> = {
  Algeria: 'dz',
  Angola: 'ao',
  Argentina: 'ar',
  Australia: 'au',
  Austria: 'at',
  Belgium: 'be',
  'Bosnia & Herzegovina': 'ba',
  'Bosnia and Herzegovina': 'ba',
  Brazil: 'br',
  Bulgaria: 'bg',
  Cameroon: 'cm',
  Canada: 'ca',
  'Cape Verde': 'cv',
  Chile: 'cl',
  Colombia: 'co',
  'Costa Rica': 'cr',
  Croatia: 'hr',
  Curaçao: 'cw',
  'Czech Republic': 'cz',
  'DR Congo': 'cd',
  Denmark: 'dk',
  Ecuador: 'ec',
  Egypt: 'eg',
  England: 'gb-eng',
  France: 'fr',
  Germany: 'de',
  Ghana: 'gh',
  Greece: 'gr',
  Haiti: 'ht',
  Honduras: 'hn',
  Iceland: 'is',
  Iran: 'ir',
  Iraq: 'iq',
  Italy: 'it',
  'Ivory Coast': 'ci',
  Jamaica: 'jm',
  Japan: 'jp',
  Jordan: 'jo',
  Mexico: 'mx',
  Morocco: 'ma',
  Netherlands: 'nl',
  'New Zealand': 'nz',
  Nigeria: 'ng',
  'North Korea': 'kp',
  Norway: 'no',
  Panama: 'pa',
  Paraguay: 'py',
  Peru: 'pe',
  Poland: 'pl',
  Portugal: 'pt',
  Qatar: 'qa',
  'Republic of Ireland': 'ie',
  Romania: 'ro',
  Russia: 'ru',
  'Saudi Arabia': 'sa',
  Scotland: 'gb-sct',
  Senegal: 'sn',
  Serbia: 'rs',
  'Serbia and Montenegro': 'rs',
  Slovakia: 'sk',
  Slovenia: 'si',
  'South Africa': 'za',
  'South Korea': 'kr',
  Spain: 'es',
  Sweden: 'se',
  Switzerland: 'ch',
  Togo: 'tg',
  Tunisia: 'tn',
  Turkey: 'tr',
  USA: 'us',
  Ukraine: 'ua',
  'United States': 'us',
  Uruguay: 'uy',
  Uzbekistan: 'uz',
  Wales: 'gb-wls',
  Yugoslavia: 'rs',
}

export function countryCode(team: string): string | null {
  return TEAM_TO_CODE[team] ?? null
}

type FlagProps = {
  team: string
  className?: string
}

/** Country flag image for a national team name. */
export function CountryFlag({ team, className }: FlagProps) {
  const code = countryCode(team)
  if (!code) {
    return <span className={className ? `flag flag--empty ${className}` : 'flag flag--empty'} />
  }
  return (
    <img
      className={className ? `flag ${className}` : 'flag'}
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={20}
      height={15}
      alt=""
      title={team}
      loading="lazy"
    />
  )
}
