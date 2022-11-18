import { getNodeByKind } from "./getNodeByKind";
import { Node, SourceFile, SyntaxKind, CallExpression } from "ts-morph";

export const insertEmitsOption = (sourceFile: SourceFile) => {
  const callexpression = getNodeByKind(sourceFile, SyntaxKind.CallExpression);

  if (!callexpression) {
    return;
  }
  if (!Node.isCallExpression(callexpression)) {
    return;
  }

  if (!isDefineComponent(callexpression)) {
    return;
  }
  const optionsNode = getNodeByKind(
    callexpression,
    SyntaxKind.ObjectLiteralExpression
  );

  if (!Node.isObjectLiteralExpression(optionsNode)) {
    return;
  }

  const emits = convertToEmits(callexpression);

  if (emits.length === 0) {
    return;
  }

  optionsNode.addProperty(`emits: [${emits.join(",")}]`);
};

const convertToEmits = (node: CallExpression) => {
  const setupNode = getNodeByKind(node, SyntaxKind.MethodDeclaration);

  if (!setupNode) {
    return [];
  }

  const blockNode = getNodeByKind(setupNode, SyntaxKind.Block);

  if (!blockNode) {
    return [];
  }

  const emitsCallExpressions = blockNode
    .forEachDescendantAsArray()
    .filter((x) => x.getKind() === SyntaxKind.CallExpression)
    .filter((x) => x.getFullText().includes("emit")) as CallExpression[];

  const emits = emitsCallExpressions.map((x) => x.getArguments()[0].getText());

  return emits.filter((x) => x !== "");
};

const isDefineComponent = (node: CallExpression) => {
  if (!Node.isIdentifier(node.getExpression())) {
    return false;
  }

  return node.getExpression().getText() === "defineComponent";
};
