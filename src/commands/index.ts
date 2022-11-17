import { DEFAULT_OPTIONS } from "./../lib/constants";
import type { Arguments, Argv } from "yargs";
import { handleCommand } from "../handlers";

type Options = {
  targetFilePaths: string[];
  tsconfigPath: string;
};

export const command = "* [targetFilePaths...]";
export const desc = "Suppress TS errors in Vue files";

export const builder = (yargs: Argv<Options>): Argv<Options> =>
  yargs.options(DEFAULT_OPTIONS).positional("targetFilePaths", {
    array: true,
    type: "string",
    demandOption: true,
    description:
      "Path to the target vue file, which can be set with the glob pattern. eg: 'src/**/*.vue'",
  } as const);

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { targetFilePaths, tsconfigPath } = argv;
  await handleCommand(targetFilePaths, tsconfigPath);
  console.log(targetFilePaths.length);
};
