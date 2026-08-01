/**
 * Campaign UI registration entry. Import AFTER `./load` (content registration): UI modules
 * depend on the locale runtime, which merges campaign messages from `./load/content`.
 * One entry per campaign folder: `src/levels/<campaignId>/registerUi.tsx`.
 */
import.meta.glob("./*/registerUi.tsx", { eager: true });
