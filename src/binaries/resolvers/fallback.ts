import parseArgs from 'minimist';
import { compact } from '../../util/array.js';
import { tryResolveFilePaths } from './util.js';
import type { Resolver } from '../types.js';
import type { ParsedArgs } from 'minimist';

type ArgResolvers = Record<string, (parsed: ParsedArgs) => string[]>;

const argFilters: ArgResolvers = {
  'babel-node': parsed => [parsed._[0], parsed.require].flat(),
  'ts-node': parsed => [parsed._[0], parsed.require].flat(),
  tsx: parsed => parsed._.filter(p => p !== 'watch'),
  default: parsed => [parsed.require].flat(),
};

export const resolve: Resolver = (binary, args, { cwd }) => {
  const parsed = parseArgs(args, { string: ['r'], alias: { require: ['r', 'loader'] } });
  const argFilter = argFilters[binary as keyof typeof argFilters] ?? argFilters.default;
  const filteredArgs = compact(argFilter(parsed));
  return [binary, ...tryResolveFilePaths(cwd, filteredArgs)];
};
