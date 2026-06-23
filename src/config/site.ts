/**
 * Site-wide constants (name, contact details, etc.).
 * Edit these placeholders with the real business information.
 */
export const SITE = {
  name: 'Høns og Foder',
  tagline: 'Kvalitetsfoder og udstyr til dine høns',
  phone: '+45 51 28 58 58',
  email: 'hoensogfoder@mail.dk',
  address: 'Bundsvej 16, 3660 Stenløse',
  /** Opening hours, one row per group of days. Single source of truth for
   *  both the hero and the footer. */
  openingHours: [
    { days: 'Mandag – Fredag', hours: '16:00 – 19:00' },
    { days: 'Lørdag', hours: '9:00 – 14:00' },
    { days: 'Søndag', hours: 'Lukket' },
  ],
} as const;

/**
 * Reservations are emailed to the shop owner via Web3Forms (a free
 * form-to-email service that works from a static site — no server needed).
 *
 * The access key is designed to live in frontend code — it only allows
 * sending TO the registered owner address, so it's safe to commit.
 */
export const RESERVATION = {
  /** Where reservation notifications are sent (the Web3Forms account email). */
  ownerEmail: 'thomasbenfer@gmail.com',
  /** Web3Forms access key (registered to the owner email above). */
  web3formsAccessKey: 'b39812b8-bd43-4051-abec-fab00e1089e3',
} as const;
