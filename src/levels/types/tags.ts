/**
 * Registry of card tags. The framework defines none; campaign packs merge their tags in via
 * `declare module` (the runtime tag list ships with the campaign's templates).
 */
export interface CardTagRegistry {}

export type CardTag = keyof CardTagRegistry & string;
