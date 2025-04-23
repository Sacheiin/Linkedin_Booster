declare module 'semver' {
  export function valid(version: string): string | null;
  export function clean(version: string): string | null;
  export function satisfies(version: string, range: string): boolean;
  export function gt(version1: string, version2: string): boolean;
  export function lt(version1: string, version2: string): boolean;
  export function gte(version1: string, version2: string): boolean;
  export function lte(version1: string, version2: string): boolean;
  export function eq(version1: string, version2: string): boolean;
  export function neq(version1: string, version2: string): boolean;
  export function cmp(version1: string, comparator: string, version2: string): boolean;
  export function compare(version1: string, version2: string): -1 | 0 | 1;
  export function rcompare(version1: string, version2: string): -1 | 0 | 1;
  export function diff(version1: string, version2: string): string | null;
  export function major(version: string): number;
  export function minor(version: string): number;
  export function patch(version: string): number;
  export function prerelease(version: string): string[] | null;
  export function inc(version: string, release: string, prerelease?: string, identifier?: string): string | null;
  export function coerce(version: string): string | null;
}