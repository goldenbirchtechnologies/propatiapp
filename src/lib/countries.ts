export type CountryCode =
  | "AF" | "AL" | "DZ" | "AS" | "AD" | "AO" | "AI" | "AQ" | "AG" | "AR"
  | "AM" | "AW" | "AU" | "AT" | "AZ" | "BS" | "BH" | "BD" | "BB" | "BY"
  | "BE" | "BZ" | "BJ" | "BM" | "BT" | "BO" | "BA" | "BW" | "BR" | "IO"
  | "BN" | "BG" | "BF" | "BI" | "KH" | "CM" | "CA" | "CV" | "KY" | "CF"
  | "TD" | "CL" | "CN" | "CX" | "CC" | "CO" | "KM" | "CG" | "CD" | "CK"
  | "CR" | "CI" | "HR" | "CU" | "CW" | "CY" | "CZ" | "DK" | "DJ" | "DM"
  | "DO" | "EC" | "EG" | "SV" | "GQ" | "ER" | "EE" | "SZ" | "ET" | "FK"
  | "FO" | "FJ" | "FI" | "FR" | "GF" | "PF" | "GA" | "GM" | "GE" | "DE"
  | "GH" | "GI" | "GR" | "GL" | "GD" | "GP" | "GU" | "GT" | "GG" | "GN"
  | "GW" | "GY" | "HT" | "HN" | "HK" | "HU" | "IS" | "IN" | "ID" | "IR"
  | "IQ" | "IE" | "IM" | "IL" | "IT" | "JM" | "JP" | "JE" | "JO" | "KZ"
  | "KE" | "KI" | "KP" | "KR" | "KW" | "KG" | "LA" | "LV" | "LB" | "LS"
  | "LR" | "LY" | "LI" | "LT" | "LU" | "MO" | "MG" | "MW" | "MY" | "MV"
  | "ML" | "MT" | "MH" | "MQ" | "MR" | "MU" | "YT" | "MX" | "FM" | "MD"
  | "MC" | "MN" | "ME" | "MS" | "MA" | "MZ" | "MM" | "NA" | "NR" | "NP"
  | "NL" | "NC" | "NZ" | "NI" | "NE" | "NG" | "NU" | "NF" | "MK" | "MP"
  | "NO" | "OM" | "PK" | "PW" | "PS" | "PA" | "PG" | "PY" | "PE" | "PH"
  | "PL" | "PT" | "PR" | "QA" | "RE" | "RO" | "RU" | "RW" | "BL" | "SH"
  | "KN" | "LC" | "MF" | "PM" | "VC" | "WS" | "SM" | "ST" | "SA" | "SN"
  | "RS" | "SC" | "SL" | "SG" | "SX" | "SK" | "SI" | "SB" | "SO" | "ZA"
  | "SS" | "ES" | "LK" | "SD" | "SR" | "SE" | "CH" | "SY" | "TW" | "TJ"
  | "TZ" | "TH" | "TL" | "TG" | "TK" | "TO" | "TT" | "TN" | "TR" | "TM"
  | "TC" | "TV" | "UG" | "UA" | "AE" | "GB" | "US" | "UY" | "UZ" | "VU"
  | "VA" | "VE" | "VN" | "VG" | "VI" | "WF" | "EH" | "YE" | "ZM" | "ZW";

export interface Country {
  code: CountryCode;
  name: string;
  phonePrefix: string;
  currency: string;
  locale: string;
  timezone: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", phonePrefix: "+93", currency: "AFN", locale: "fa-AF", timezone: "Asia/Kabul" },
  { code: "AL", name: "Albania", phonePrefix: "+355", currency: "ALL", locale: "sq-AL", timezone: "Europe/Tirana" },
  { code: "DZ", name: "Algeria", phonePrefix: "+213", currency: "DZD", locale: "ar-DZ", timezone: "Africa/Algiers" },
  { code: "AS", name: "American Samoa", phonePrefix: "+1684", currency: "USD", locale: "en-AS", timezone: "Pacific/Pago_Pago" },
  { code: "AD", name: "Andorra", phonePrefix: "+376", currency: "EUR", locale: "ca-AD", timezone: "Europe/Andorra" },
  { code: "AO", name: "Angola", phonePrefix: "+244", currency: "AOA", locale: "pt-AO", timezone: "Africa/Luanda" },
  { code: "AI", name: "Anguilla", phonePrefix: "+1264", currency: "XCD", locale: "en-AI", timezone: "America/Anguilla" },
  { code: "AQ", name: "Antarctica", phonePrefix: "+672", currency: "USD", locale: "en-AQ", timezone: "Antarctica/McMurdo" },
  { code: "AG", name: "Antigua and Barbuda", phonePrefix: "+1268", currency: "XCD", locale: "en-AG", timezone: "America/Antigua" },
  { code: "AR", name: "Argentina", phonePrefix: "+54", currency: "ARS", locale: "es-AR", timezone: "America/Argentina/Buenos_Aires" },
  { code: "AM", name: "Armenia", phonePrefix: "+374", currency: "AMD", locale: "hy-AM", timezone: "Asia/Yerevan" },
  { code: "AW", name: "Aruba", phonePrefix: "+297", currency: "AWG", locale: "nl-AW", timezone: "America/Aruba" },
  { code: "AU", name: "Australia", phonePrefix: "+61", currency: "AUD", locale: "en-AU", timezone: "Australia/Sydney" },
  { code: "AT", name: "Austria", phonePrefix: "+43", currency: "EUR", locale: "de-AT", timezone: "Europe/Vienna" },
  { code: "AZ", name: "Azerbaijan", phonePrefix: "+994", currency: "AZN", locale: "az-AZ", timezone: "Asia/Baku" },
  { code: "BS", name: "Bahamas", phonePrefix: "+1242", currency: "BSD", locale: "en-BS", timezone: "America/Nassau" },
  { code: "BH", name: "Bahrain", phonePrefix: "+973", currency: "BHD", locale: "ar-BH", timezone: "Asia/Bahrain" },
  { code: "BD", name: "Bangladesh", phonePrefix: "+880", currency: "BDT", locale: "bn-BD", timezone: "Asia/Dhaka" },
  { code: "BB", name: "Barbados", phonePrefix: "+1246", currency: "BBD", locale: "en-BB", timezone: "America/Barbados" },
  { code: "BY", name: "Belarus", phonePrefix: "+375", currency: "BYN", locale: "be-BY", timezone: "Europe/Minsk" },
  { code: "BE", name: "Belgium", phonePrefix: "+32", currency: "EUR", locale: "nl-BE", timezone: "Europe/Brussels" },
  { code: "BZ", name: "Belize", phonePrefix: "+501", currency: "BZD", locale: "en-BZ", timezone: "America/Belize" },
  { code: "BJ", name: "Benin", phonePrefix: "+229", currency: "XOF", locale: "fr-BJ", timezone: "Africa/Porto-Novo" },
  { code: "BM", name: "Bermuda", phonePrefix: "+1441", currency: "BMD", locale: "en-BM", timezone: "Atlantic/Bermuda" },
  { code: "BT", name: "Bhutan", phonePrefix: "+975", currency: "BTN", locale: "dz-BT", timezone: "Asia/Thimphu" },
  { code: "BO", name: "Bolivia", phonePrefix: "+591", currency: "BOB", locale: "es-BO", timezone: "America/La_Paz" },
  { code: "BA", name: "Bosnia", phonePrefix: "+387", currency: "BAM", locale: "bs-BA", timezone: "Europe/Sarajevo" },
  { code: "BW", name: "Botswana", phonePrefix: "+267", currency: "BWP", locale: "en-BW", timezone: "Africa/Gaborone" },
  { code: "BR", name: "Brazil", phonePrefix: "+55", currency: "BRL", locale: "pt-BR", timezone: "America/Sao_Paulo" },
  { code: "IO", name: "British Indian Ocean Territory", phonePrefix: "+246", currency: "USD", locale: "en-IO", timezone: "Indian/Chagos" },
  { code: "BN", name: "Brunei", phonePrefix: "+673", currency: "BND", locale: "ms-BN", timezone: "Asia/Brunei" },
  { code: "BG", name: "Bulgaria", phonePrefix: "+359", currency: "BGN", locale: "bg-BG", timezone: "Europe/Sofia" },
  { code: "BF", name: "Burkina Faso", phonePrefix: "+226", currency: "XOF", locale: "fr-BF", timezone: "Africa/Ouagadougou" },
  { code: "BI", name: "Burundi", phonePrefix: "+257", currency: "BIF", locale: "fr-BI", timezone: "Africa/Bujumbura" },
  { code: "KH", name: "Cambodia", phonePrefix: "+855", currency: "KHR", locale: "km-KH", timezone: "Asia/Phnom_Penh" },
  { code: "CM", name: "Cameroon", phonePrefix: "+237", currency: "XAF", locale: "fr-CM", timezone: "Africa/Douala" },
  { code: "CA", name: "Canada", phonePrefix: "+1", currency: "CAD", locale: "en-CA", timezone: "America/Toronto" },
  { code: "CV", name: "Cape Verde", phonePrefix: "+238", currency: "CVE", locale: "pt-CV", timezone: "Atlantic/Cape_Verde" },
  { code: "KY", name: "Cayman Islands", phonePrefix: "+1345", currency: "KYD", locale: "en-KY", timezone: "America/Cayman" },
  { code: "CF", name: "Central African Republic", phonePrefix: "+236", currency: "XAF", locale: "fr-CF", timezone: "Africa/Bangui" },
  { code: "TD", name: "Chad", phonePrefix: "+235", currency: "XAF", locale: "fr-TD", timezone: "Africa/Ndjamena" },
  { code: "CL", name: "Chile", phonePrefix: "+56", currency: "CLP", locale: "es-CL", timezone: "America/Santiago" },
  { code: "CN", name: "China", phonePrefix: "+86", currency: "CNY", locale: "zh-CN", timezone: "Asia/Shanghai" },
  { code: "CO", name: "Colombia", phonePrefix: "+57", currency: "COP", locale: "es-CO", timezone: "America/Bogota" },
  { code: "KM", name: "Comoros", phonePrefix: "+269", currency: "KMF", locale: "ar-KM", timezone: "Indian/Comoro" },
  { code: "CG", name: "Congo", phonePrefix: "+242", currency: "XAF", locale: "fr-CG", timezone: "Africa/Brazzaville" },
  { code: "CD", name: "DR Congo", phonePrefix: "+243", currency: "CDF", locale: "fr-CD", timezone: "Africa/Kinshasa" },
  { code: "CK", name: "Cook Islands", phonePrefix: "+682", currency: "NZD", locale: "en-CK", timezone: "Pacific/Rarotonga" },
  { code: "CR", name: "Costa Rica", phonePrefix: "+506", currency: "CRC", locale: "es-CR", timezone: "America/Costa_Rica" },
  { code: "HR", name: "Croatia", phonePrefix: "+385", currency: "EUR", locale: "hr-HR", timezone: "Europe/Zagreb" },
  { code: "CU", name: "Cuba", phonePrefix: "+53", currency: "CUP", locale: "es-CU", timezone: "America/Havana" },
  { code: "CY", name: "Cyprus", phonePrefix: "+357", currency: "EUR", locale: "el-CY", timezone: "Asia/Nicosia" },
  { code: "CZ", name: "Czechia", phonePrefix: "+420", currency: "CZK", locale: "cs-CZ", timezone: "Europe/Prague" },
  { code: "DK", name: "Denmark", phonePrefix: "+45", currency: "DKK", locale: "da-DK", timezone: "Europe/Copenhagen" },
  { code: "DJ", name: "Djibouti", phonePrefix: "+253", currency: "DJF", locale: "fr-DJ", timezone: "Africa/Djibouti" },
  { code: "DM", name: "Dominica", phonePrefix: "+1767", currency: "XCD", locale: "en-DM", timezone: "America/Dominica" },
  { code: "DO", name: "Dominican Republic", phonePrefix: "+1809", currency: "DOP", locale: "es-DO", timezone: "America/Santo_Domingo" },
  { code: "EC", name: "Ecuador", phonePrefix: "+593", currency: "USD", locale: "es-EC", timezone: "America/Guayaquil" },
  { code: "EG", name: "Egypt", phonePrefix: "+20", currency: "EGP", locale: "ar-EG", timezone: "Africa/Cairo" },
  { code: "SV", name: "El Salvador", phonePrefix: "+503", currency: "USD", locale: "es-SV", timezone: "America/El_Salvador" },
  { code: "GQ", name: "Equatorial Guinea", phonePrefix: "+240", currency: "XAF", locale: "es-GQ", timezone: "Africa/Malabo" },
  { code: "ER", name: "Eritrea", phonePrefix: "+291", currency: "ERN", locale: "ti-ER", timezone: "Africa/Asmara" },
  { code: "EE", name: "Estonia", phonePrefix: "+372", currency: "EUR", locale: "et-EE", timezone: "Europe/Tallinn" },
  { code: "SZ", name: "Eswatini", phonePrefix: "+268", currency: "SZL", locale: "en-SZ", timezone: "Africa/Mbabane" },
  { code: "ET", name: "Ethiopia", phonePrefix: "+251", currency: "ETB", locale: "am-ET", timezone: "Africa/Addis_Ababa" },
  { code: "FK", name: "Falkland Islands", phonePrefix: "+500", currency: "FKP", locale: "en-FK", timezone: "Atlantic/Stanley" },
  { code: "FO", name: "Faroe Islands", phonePrefix: "+298", currency: "DKK", locale: "fo-FO", timezone: "Atlantic/Faroe" },
  { code: "FJ", name: "Fiji", phonePrefix: "+679", currency: "FJD", locale: "en-FJ", timezone: "Pacific/Fiji" },
  { code: "FI", name: "Finland", phonePrefix: "+358", currency: "EUR", locale: "fi-FI", timezone: "Europe/Helsinki" },
  { code: "FR", name: "France", phonePrefix: "+33", currency: "EUR", locale: "fr-FR", timezone: "Europe/Paris" },
  { code: "GF", name: "French Guiana", phonePrefix: "+594", currency: "EUR", locale: "fr-GF", timezone: "America/Cayenne" },
  { code: "PF", name: "French Polynesia", phonePrefix: "+689", currency: "XPF", locale: "fr-PF", timezone: "Pacific/Tahiti" },
  { code: "GA", name: "Gabon", phonePrefix: "+241", currency: "XAF", locale: "fr-GA", timezone: "Africa/Libreville" },
  { code: "GM", name: "Gambia", phonePrefix: "+220", currency: "GMD", locale: "en-GM", timezone: "Africa/Banjul" },
  { code: "GE", name: "Georgia", phonePrefix: "+995", currency: "GEL", locale: "ka-GE", timezone: "Asia/Tbilisi" },
  { code: "DE", name: "Germany", phonePrefix: "+49", currency: "EUR", locale: "de-DE", timezone: "Europe/Berlin" },
  { code: "GH", name: "Ghana", phonePrefix: "+233", currency: "GHS", locale: "en-GH", timezone: "Africa/Accra" },
  { code: "GI", name: "Gibraltar", phonePrefix: "+350", currency: "GIP", locale: "en-GI", timezone: "Europe/Gibraltar" },
  { code: "GR", name: "Greece", phonePrefix: "+30", currency: "EUR", locale: "el-GR", timezone: "Europe/Athens" },
  { code: "GL", name: "Greenland", phonePrefix: "+299", currency: "DKK", locale: "kl-GL", timezone: "America/Godthab" },
  { code: "GD", name: "Grenada", phonePrefix: "+1473", currency: "XCD", locale: "en-GD", timezone: "America/Grenada" },
  { code: "GP", name: "Guadeloupe", phonePrefix: "+590", currency: "EUR", locale: "fr-GP", timezone: "America/Guadeloupe" },
  { code: "GU", name: "Guam", phonePrefix: "+1671", currency: "USD", locale: "en-GU", timezone: "Pacific/Guam" },
  { code: "GT", name: "Guatemala", phonePrefix: "+502", currency: "GTQ", locale: "es-GT", timezone: "America/Guatemala" },
  { code: "GG", name: "Guernsey", phonePrefix: "+44", currency: "GBP", locale: "en-GG", timezone: "Europe/Guernsey" },
  { code: "GN", name: "Guinea", phonePrefix: "+224", currency: "GNF", locale: "fr-GN", timezone: "Africa/Conakry" },
  { code: "GW", name: "Guinea-Bissau", phonePrefix: "+245", currency: "XOF", locale: "pt-GW", timezone: "Africa/Bissau" },
  { code: "GY", name: "Guyana", phonePrefix: "+592", currency: "GYD", locale: "en-GY", timezone: "America/Guyana" },
  { code: "HT", name: "Haiti", phonePrefix: "+509", currency: "HTG", locale: "fr-HT", timezone: "America/Port-au-Prince" },
  { code: "HN", name: "Honduras", phonePrefix: "+504", currency: "HNL", locale: "es-HN", timezone: "America/Tegucigalpa" },
  { code: "HK", name: "Hong Kong", phonePrefix: "+852", currency: "HKD", locale: "zh-HK", timezone: "Asia/Hong_Kong" },
  { code: "HU", name: "Hungary", phonePrefix: "+36", currency: "HUF", locale: "hu-HU", timezone: "Europe/Budapest" },
  { code: "IS", name: "Iceland", phonePrefix: "+354", currency: "ISK", locale: "is-IS", timezone: "Atlantic/Reykjavik" },
  { code: "IN", name: "India", phonePrefix: "+91", currency: "INR", locale: "hi-IN", timezone: "Asia/Kolkata" },
  { code: "ID", name: "Indonesia", phonePrefix: "+62", currency: "IDR", locale: "id-ID", timezone: "Asia/Jakarta" },
  { code: "IR", name: "Iran", phonePrefix: "+98", currency: "IRR", locale: "fa-IR", timezone: "Asia/Tehran" },
  { code: "IQ", name: "Iraq", phonePrefix: "+964", currency: "IQD", locale: "ar-IQ", timezone: "Asia/Baghdad" },
  { code: "IE", name: "Ireland", phonePrefix: "+353", currency: "EUR", locale: "ga-IE", timezone: "Europe/Dublin" },
  { code: "IM", name: "Isle of Man", phonePrefix: "+44", currency: "GBP", locale: "en-IM", timezone: "Europe/Isle_of_Man" },
  { code: "IL", name: "Israel", phonePrefix: "+972", currency: "ILS", locale: "he-IL", timezone: "Asia/Jerusalem" },
  { code: "IT", name: "Italy", phonePrefix: "+39", currency: "EUR", locale: "it-IT", timezone: "Europe/Rome" },
  { code: "CI", name: "Cote d Ivoire", phonePrefix: "+225", currency: "XOF", locale: "fr-CI", timezone: "Africa/Abidjan" },
  { code: "JM", name: "Jamaica", phonePrefix: "+1876", currency: "JMD", locale: "en-JM", timezone: "America/Jamaica" },
  { code: "JP", name: "Japan", phonePrefix: "+81", currency: "JPY", locale: "ja-JP", timezone: "Asia/Tokyo" },
  { code: "JE", name: "Jersey", phonePrefix: "+44", currency: "GBP", locale: "en-JE", timezone: "Europe/Jersey" },
  { code: "JO", name: "Jordan", phonePrefix: "+962", currency: "JOD", locale: "ar-JO", timezone: "Asia/Amman" },
  { code: "KZ", name: "Kazakhstan", phonePrefix: "+7", currency: "KZT", locale: "kk-KZ", timezone: "Asia/Almaty" },
  { code: "KE", name: "Kenya", phonePrefix: "+254", currency: "KES", locale: "sw-KE", timezone: "Africa/Nairobi" },
  { code: "KI", name: "Kiribati", phonePrefix: "+686", currency: "AUD", locale: "en-KI", timezone: "Pacific/Tarawa" },
  { code: "KP", name: "North Korea", phonePrefix: "+850", currency: "KPW", locale: "ko-KP", timezone: "Asia/Pyongyang" },
  { code: "KR", name: "South Korea", phonePrefix: "+82", currency: "KRW", locale: "ko-KR", timezone: "Asia/Seoul" },
  { code: "KW", name: "Kuwait", phonePrefix: "+965", currency: "KWD", locale: "ar-KW", timezone: "Asia/Kuwait" },
  { code: "KG", name: "Kyrgyzstan", phonePrefix: "+996", currency: "KGS", locale: "ky-KG", timezone: "Asia/Bishkek" },
  { code: "LA", name: "Laos", phonePrefix: "+856", currency: "LAK", locale: "lo-LA", timezone: "Asia/Vientiane" },
  { code: "LV", name: "Latvia", phonePrefix: "+371", currency: "EUR", locale: "lv-LV", timezone: "Europe/Riga" },
  { code: "LB", name: "Lebanon", phonePrefix: "+961", currency: "LBP", locale: "ar-LB", timezone: "Asia/Beirut" },
  { code: "LS", name: "Lesotho", phonePrefix: "+266", currency: "LSL", locale: "en-LS", timezone: "Africa/Maseru" },
  { code: "LR", name: "Liberia", phonePrefix: "+231", currency: "LRD", locale: "en-LR", timezone: "Africa/Monrovia" },
  { code: "LY", name: "Libya", phonePrefix: "+218", currency: "LYD", locale: "ar-LY", timezone: "Africa/Tripoli" },
  { code: "LI", name: "Liechtenstein", phonePrefix: "+423", currency: "CHF", locale: "de-LI", timezone: "Europe/Vaduz" },
  { code: "LT", name: "Lithuania", phonePrefix: "+370", currency: "EUR", locale: "lt-LT", timezone: "Europe/Vilnius" },
  { code: "LU", name: "Luxembourg", phonePrefix: "+352", currency: "EUR", locale: "lb-LU", timezone: "Europe/Luxembourg" },
  { code: "MO", name: "Macau", phonePrefix: "+853", currency: "MOP", locale: "zh-MO", timezone: "Asia/Macau" },
  { code: "MG", name: "Madagascar", phonePrefix: "+261", currency: "MGA", locale: "fr-MG", timezone: "Indian/Antananarivo" },
  { code: "MW", name: "Malawi", phonePrefix: "+265", currency: "MWK", locale: "en-MW", timezone: "Africa/Blantyre" },
  { code: "MY", name: "Malaysia", phonePrefix: "+60", currency: "MYR", locale: "ms-MY", timezone: "Asia/Kuala_Lumpur" },
  { code: "MV", name: "Maldives", phonePrefix: "+960", currency: "MVR", locale: "dv-MV", timezone: "Indian/Maldives" },
  { code: "ML", name: "Mali", phonePrefix: "+223", currency: "XOF", locale: "fr-ML", timezone: "Africa/Bamako" },
  { code: "MT", name: "Malta", phonePrefix: "+356", currency: "EUR", locale: "mt-MT", timezone: "Europe/Malta" },
  { code: "MH", name: "Marshall Islands", phonePrefix: "+692", currency: "USD", locale: "en-MH", timezone: "Pacific/Majuro" },
  { code: "MQ", name: "Martinique", phonePrefix: "+596", currency: "EUR", locale: "fr-MQ", timezone: "America/Martinique" },
  { code: "MR", name: "Mauritania", phonePrefix: "+222", currency: "MRU", locale: "ar-MR", timezone: "Africa/Nouakchott" },
  { code: "MU", name: "Mauritius", phonePrefix: "+230", currency: "MUR", locale: "en-MU", timezone: "Indian/Mauritius" },
  { code: "YT", name: "Mayotte", phonePrefix: "+262", currency: "EUR", locale: "fr-YT", timezone: "Indian/Mayotte" },
  { code: "MX", name: "Mexico", phonePrefix: "+52", currency: "MXN", locale: "es-MX", timezone: "America/Mexico_City" },
  { code: "FM", name: "Micronesia", phonePrefix: "+691", currency: "USD", locale: "en-FM", timezone: "Pacific/Pohnpei" },
  { code: "MD", name: "Moldova", phonePrefix: "+373", currency: "MDL", locale: "ro-MD", timezone: "Europe/Chisinau" },
  { code: "MC", name: "Monaco", phonePrefix: "+377", currency: "EUR", locale: "fr-MC", timezone: "Europe/Monaco" },
  { code: "MN", name: "Mongolia", phonePrefix: "+976", currency: "MNT", locale: "mn-MN", timezone: "Asia/Ulaanbaatar" },
  { code: "ME", name: "Montenegro", phonePrefix: "+382", currency: "EUR", locale: "sr-ME", timezone: "Europe/Podgorica" },
  { code: "MS", name: "Montserrat", phonePrefix: "+1664", currency: "XCD", locale: "en-MS", timezone: "America/Montserrat" },
  { code: "MA", name: "Morocco", phonePrefix: "+212", currency: "MAD", locale: "ar-MA", timezone: "Africa/Casablanca" },
  { code: "MZ", name: "Mozambique", phonePrefix: "+258", currency: "MZN", locale: "pt-MZ", timezone: "Africa/Maputo" },
  { code: "MM", name: "Myanmar", phonePrefix: "+95", currency: "MMK", locale: "my-MM", timezone: "Asia/Yangon" },
  { code: "NA", name: "Namibia", phonePrefix: "+264", currency: "NAD", locale: "en-NA", timezone: "Africa/Windhoek" },
  { code: "NR", name: "Nauru", phonePrefix: "+674", currency: "AUD", locale: "en-NR", timezone: "Pacific/Nauru" },
  { code: "NP", name: "Nepal", phonePrefix: "+977", currency: "NPR", locale: "ne-NP", timezone: "Asia/Kathmandu" },
  { code: "NL", name: "Netherlands", phonePrefix: "+31", currency: "EUR", locale: "nl-NL", timezone: "Europe/Amsterdam" },
  { code: "NC", name: "New Caledonia", phonePrefix: "+687", currency: "XPF", locale: "fr-NC", timezone: "Pacific/Noumea" },
  { code: "NZ", name: "New Zealand", phonePrefix: "+64", currency: "NZD", locale: "en-NZ", timezone: "Pacific/Auckland" },
  { code: "NI", name: "Nicaragua", phonePrefix: "+505", currency: "NIO", locale: "es-NI", timezone: "America/Managua" },
  { code: "NE", name: "Niger", phonePrefix: "+227", currency: "XOF", locale: "fr-NE", timezone: "Africa/Niamey" },
  { code: "NG", name: "Nigeria", phonePrefix: "+234", currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" },
  { code: "NU", name: "Niue", phonePrefix: "+683", currency: "NZD", locale: "en-NU", timezone: "Pacific/Niue" },
  { code: "NF", name: "Norfolk Island", phonePrefix: "+672", currency: "AUD", locale: "en-NF", timezone: "Pacific/Norfolk" },
  { code: "MK", name: "North Macedonia", phonePrefix: "+389", currency: "MKD", locale: "mk-MK", timezone: "Europe/Skopje" },
  { code: "MP", name: "Northern Mariana Islands", phonePrefix: "+1670", currency: "USD", locale: "en-MP", timezone: "Pacific/Saipan" },
  { code: "NO", name: "Norway", phonePrefix: "+47", currency: "NOK", locale: "nb-NO", timezone: "Europe/Oslo" },
  { code: "OM", name: "Oman", phonePrefix: "+968", currency: "OMR", locale: "ar-OM", timezone: "Asia/Muscat" },
  { code: "PK", name: "Pakistan", phonePrefix: "+92", currency: "PKR", locale: "ur-PK", timezone: "Asia/Karachi" },
  { code: "PW", name: "Palau", phonePrefix: "+680", currency: "USD", locale: "en-PW", timezone: "Pacific/Palau" },
  { code: "PS", name: "Palestine", phonePrefix: "+970", currency: "ILS", locale: "ar-PS", timezone: "Asia/Gaza" },
  { code: "PA", name: "Panama", phonePrefix: "+507", currency: "PAB", locale: "es-PA", timezone: "America/Panama" },
  { code: "PG", name: "Papua New Guinea", phonePrefix: "+675", currency: "PGK", locale: "en-PG", timezone: "Pacific/Port_Moresby" },
  { code: "PY", name: "Paraguay", phonePrefix: "+595", currency: "PYG", locale: "es-PY", timezone: "America/Asuncion" },
  { code: "PE", name: "Peru", phonePrefix: "+51", currency: "PEN", locale: "es-PE", timezone: "America/Lima" },
  { code: "PH", name: "Philippines", phonePrefix: "+63", currency: "PHP", locale: "en-PH", timezone: "Asia/Manila" },
  { code: "PL", name: "Poland", phonePrefix: "+48", currency: "PLN", locale: "pl-PL", timezone: "Europe/Warsaw" },
  { code: "PT", name: "Portugal", phonePrefix: "+351", currency: "EUR", locale: "pt-PT", timezone: "Europe/Lisbon" },
  { code: "PR", name: "Puerto Rico", phonePrefix: "+1787", currency: "USD", locale: "es-PR", timezone: "America/Puerto_Rico" },
  { code: "QA", name: "Qatar", phonePrefix: "+974", currency: "QAR", locale: "ar-QA", timezone: "Asia/Qatar" },
  { code: "RO", name: "Romania", phonePrefix: "+40", currency: "RON", locale: "ro-RO", timezone: "Europe/Bucharest" },
  { code: "RU", name: "Russia", phonePrefix: "+7", currency: "RUB", locale: "ru-RU", timezone: "Europe/Moscow" },
  { code: "RW", name: "Rwanda", phonePrefix: "+255", currency: "RWF", locale: "rw-RW", timezone: "Africa/Kigali" },
  { code: "RE", name: "Reunion", phonePrefix: "+262", currency: "EUR", locale: "fr-RE", timezone: "Indian/Reunion" },
  { code: "BL", name: "Saint Barthelemy", phonePrefix: "+590", currency: "EUR", locale: "fr-BL", timezone: "America/St_Barthelemy" },
  { code: "SH", name: "Saint Helena", phonePrefix: "+290", currency: "SHP", locale: "en-SH", timezone: "Atlantic/St_Helena" },
  { code: "KN", name: "Saint Kitts and Nevis", phonePrefix: "+1869", currency: "XCD", locale: "en-KN", timezone: "America/St_Kitts" },
  { code: "LC", name: "Saint Lucia", phonePrefix: "+1758", currency: "XCD", locale: "en-LC", timezone: "America/St_Lucia" },
  { code: "MF", name: "Saint Martin", phonePrefix: "+590", currency: "EUR", locale: "fr-MF", timezone: "America/Marigot" },
  { code: "PM", name: "Saint Pierre and Miquelon", phonePrefix: "+508", currency: "EUR", locale: "fr-PM", timezone: "America/Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines", phonePrefix: "+1784", currency: "XCD", locale: "en-VC", timezone: "America/St_Vincent" },
  { code: "WS", name: "Samoa", phonePrefix: "+685", currency: "WST", locale: "sm-WS", timezone: "Pacific/Apia" },
  { code: "SM", name: "San Marino", phonePrefix: "+378", currency: "EUR", locale: "it-SM", timezone: "Europe/San_Marino" },
  { code: "ST", name: "Sao Tome and Principe", phonePrefix: "+239", currency: "STN", locale: "pt-ST", timezone: "Africa/Sao_Tome" },
  { code: "SA", name: "Saudi Arabia", phonePrefix: "+966", currency: "SAR", locale: "ar-SA", timezone: "Asia/Riyadh" },
  { code: "SN", name: "Senegal", phonePrefix: "+221", currency: "XOF", locale: "fr-SN", timezone: "Africa/Dakar" },
  { code: "RS", name: "Serbia", phonePrefix: "+381", currency: "RSD", locale: "sr-RS", timezone: "Europe/Belgrade" },
  { code: "SC", name: "Seychelles", phonePrefix: "+248", currency: "SCR", locale: "en-SC", timezone: "Indian/Mahe" },
  { code: "SL", name: "Sierra Leone", phonePrefix: "+232", currency: "SLL", locale: "en-SL", timezone: "Africa/Freetown" },
  { code: "SG", name: "Singapore", phonePrefix: "+65", currency: "SGD", locale: "en-SG", timezone: "Asia/Singapore" },
  { code: "SK", name: "Slovakia", phonePrefix: "+421", currency: "EUR", locale: "sk-SK", timezone: "Europe/Bratislava" },
  { code: "SI", name: "Slovenia", phonePrefix: "+386", currency: "EUR", locale: "sl-SI", timezone: "Europe/Ljubljana" },
  { code: "SB", name: "Solomon Islands", phonePrefix: "+677", currency: "SBD", locale: "en-SB", timezone: "Pacific/Guadalcanal" },
  { code: "SO", name: "Somalia", phonePrefix: "+252", currency: "SOS", locale: "so-SO", timezone: "Africa/Mogadishu" },
  { code: "ZA", name: "South Africa", phonePrefix: "+27", currency: "ZAF", locale: "en-ZA", timezone: "Africa/Johannesburg" },
  { code: "SS", name: "South Sudan", phonePrefix: "+211", currency: "SSP", locale: "en-SS", timezone: "Africa/Juba" },
  { code: "ES", name: "Spain", phonePrefix: "+34", currency: "EUR", locale: "es-ES", timezone: "Europe/Madrid" },
  { code: "LK", name: "Sri Lanka", phonePrefix: "+94", currency: "LKR", locale: "si-LK", timezone: "Asia/Colombo" },
  { code: "SD", name: "Sudan", phonePrefix: "+249", currency: "SDG", locale: "ar-SD", timezone: "Africa/Khartoum" },
  { code: "SR", name: "Suriname", phonePrefix: "+597", currency: "SRD", locale: "nl-SR", timezone: "America/Paramaribo" },
  { code: "SE", name: "Sweden", phonePrefix: "+46", currency: "SEK", locale: "sv-SE", timezone: "Europe/Stockholm" },
  { code: "CH", name: "Switzerland", phonePrefix: "+41", currency: "CHF", locale: "de-CH", timezone: "Europe/Zurich" },
  { code: "SY", name: "Syria", phonePrefix: "+963", currency: "SYP", locale: "ar-SY", timezone: "Asia/Damascus" },
  { code: "TW", name: "Taiwan", phonePrefix: "+886", currency: "TWD", locale: "zh-TW", timezone: "Asia/Taipei" },
  { code: "TJ", name: "Tajikistan", phonePrefix: "+992", currency: "TJS", locale: "tg-TJ", timezone: "Asia/Dushanbe" },
  { code: "TZ", name: "Tanzania", phonePrefix: "+255", currency: "TZS", locale: "sw-TZ", timezone: "Africa/Dar_es_Salaam" },
  { code: "TH", name: "Thailand", phonePrefix: "+66", currency: "THB", locale: "th-TH", timezone: "Asia/Bangkok" },
  { code: "TL", name: "Timor-Leste", phonePrefix: "+670", currency: "USD", locale: "pt-TL", timezone: "Asia/Dili" },
  { code: "TG", name: "Togo", phonePrefix: "+228", currency: "XOF", locale: "fr-TG", timezone: "Africa/Lome" },
  { code: "TK", name: "Tokelau", phonePrefix: "+690", currency: "NZD", locale: "en-TK", timezone: "Pacific/Fakaofo" },
  { code: "TO", name: "Tonga", phonePrefix: "+676", currency: "TOP", locale: "to-TO", timezone: "Pacific/Tongatapu" },
  { code: "TT", name: "Trinidad and Tobago", phonePrefix: "+1868", currency: "TTD", locale: "en-TT", timezone: "America/Port_of_Spain" },
  { code: "TN", name: "Tunisia", phonePrefix: "+216", currency: "TND", locale: "ar-TN", timezone: "Africa/Tunis" },
  { code: "TR", name: "Turkiye", phonePrefix: "+90", currency: "TRY", locale: "tr-TR", timezone: "Europe/Istanbul" },
  { code: "TM", name: "Turkmenistan", phonePrefix: "+993", currency: "TMT", locale: "tk-TM", timezone: "Asia/Ashgabat" },
  { code: "TC", name: "Turks and Caicos Islands", phonePrefix: "+1649", currency: "USD", locale: "en-TC", timezone: "America/Grand_Turk" },
  { code: "TV", name: "Tuvalu", phonePrefix: "+688", currency: "AUD", locale: "en-TV", timezone: "Pacific/Funafuti" },
  { code: "UG", name: "Uganda", phonePrefix: "+256", currency: "XUG", locale: "sw-UG", timezone: "Africa/Kampala" },
  { code: "UA", name: "Ukraine", phonePrefix: "+380", currency: "UAH", locale: "uk-UA", timezone: "Europe/Kyiv" },
  { code: "AE", name: "United Arab Emirates", phonePrefix: "+971", currency: "AED", locale: "ar-AE", timezone: "Asia/Dubai" },
  { code: "GB", name: "United Kingdom", phonePrefix: "+44", currency: "GBP", locale: "en-GB", timezone: "Europe/London" },
  { code: "US", name: "United States", phonePrefix: "+1", currency: "USD", locale: "en-US", timezone: "America/New_York" },
  { code: "UY", name: "Uruguay", phonePrefix: "+598", currency: "UYU", locale: "es-UY", timezone: "America/Montevideo" },
  { code: "UZ", name: "Uzbekistan", phonePrefix: "+998", currency: "UZS", locale: "uz-UZ", timezone: "Asia/Tashkent" },
  { code: "VU", name: "Vanuatu", phonePrefix: "+678", currency: "VUV", locale: "bi-VU", timezone: "Pacific/Efate" },
  { code: "VA", name: "Vatican City", phonePrefix: "+39", currency: "EUR", locale: "it-VA", timezone: "Europe/Vatican" },
  { code: "VE", name: "Venezuela", phonePrefix: "+58", currency: "VES", locale: "es-VE", timezone: "America/Caracas" },
  { code: "VN", name: "Vietnam", phonePrefix: "+84", currency: "VND", locale: "vi-VN", timezone: "Asia/Ho_Chi_Minh" },
  { code: "VG", name: "British Virgin Islands", phonePrefix: "+1284", currency: "USD", locale: "en-VG", timezone: "America/Tortola" },
  { code: "VI", name: "U.S. Virgin Islands", phonePrefix: "+1340", currency: "USD", locale: "en-VI", timezone: "America/St_Thomas" },
  { code: "WF", name: "Wallis and Futuna", phonePrefix: "+681", currency: "XPF", locale: "fr-WF", timezone: "Pacific/Wallis" },
  { code: "EH", name: "Western Sahara", phonePrefix: "+212", currency: "MAD", locale: "ar-EH", timezone: "Africa/El_Aaiun" },
  { code: "YE", name: "Yemen", phonePrefix: "+967", currency: "YER", locale: "ar-YE", timezone: "Asia/Aden" },
  { code: "ZM", name: "Zambia", phonePrefix: "+260", currency: "ZMW", locale: "en-ZM", timezone: "Africa/Lusaka" },
  { code: "ZW", name: "Zimbabwe", phonePrefix: "+263", currency: "ZWL", locale: "en-ZW", timezone: "Africa/Harare" },
];

export const SUPPORTED_COUNTRIES: CountryCode[] = ["NG", "GH", "GB", "BJ", "IT"];

export function getCountryByCode(code) {
  return COUNTRIES.find(c => c.code === code);
}

export function isSupportedCountry(code) {
  return SUPPORTED_COUNTRIES.includes(code);
}

export function getPhonePrefix(code) {
  return getCountryByCode(code)?.phonePrefix ?? "+1";
}

export function getCurrencyForCountry(code) {
  return getCountryByCode(code)?.currency ?? "USD";
}

export function getCountryByName(name) {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}
