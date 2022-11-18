import { parse } from "@vue/compiler-sfc";
import { readFile, writeFile } from "fs/promises";
import { Project } from "ts-morph";
import { insertEmitsOption } from "../lib/insertEmitsOption";

export const handleCommand = async (
  targetFilePaths: string[],
  tsconfigPath: string
) => {
  const allFiles = await Promise.all(
    targetFilePaths.map(async (path) => {
      const fullText = await readFile(path, "utf8");
      const script = parse(fullText).descriptor.script?.content ?? "";
      return {
        path,
        fullText,
        script,
      };
    })
  );

  const targetFiles = allFiles.filter((file) => file.script !== "");

  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const targetFilesWithSourceFile = targetFiles.map((file) => {
    const sourceFile = project.createSourceFile(`${file.path}.ts`, file.script);

    return {
      ...file,
      sourceFile,
    };
  });

  for (const file of targetFilesWithSourceFile) {
    const { result } = insertEmitsOption(file.sourceFile);

    if (!result) {
      continue;
    }

    const newText = file.fullText.replace(file.script, file.sourceFile.print());
    await writeFile(file.path, newText);
  }
};
