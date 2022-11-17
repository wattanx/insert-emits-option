import { getNodeByKind } from "./getNodeByKind";
import { Node, SourceFile, SyntaxKind, CallExpression } from "ts-morph";

export const insertEmitsOption = (sourceFile: SourceFile) => {
  const callexpression = getNodeByKind(sourceFile, SyntaxKind.CallExpression);

  if (!callexpression) {
    throw new Error("defineComponent is not found.");
  }
  if (!Node.isCallExpression(callexpression)) {
    throw new Error("defineComponent is not found.");
  }

  if (!isDefineComponent(callexpression)) {
    throw new Error("defineComponent is not found.");
  }
  const optionsNode = getNodeByKind(
    callexpression,
    SyntaxKind.ObjectLiteralExpression
  );

  if (!Node.isObjectLiteralExpression(optionsNode)) {
    throw new Error("defineComponent is not found.");
  }

  const emits = convertToEmits(callexpression);

  optionsNode.addProperty(`emits: [${emits.join(",")}]`);
};

const convertToEmits = (node: CallExpression) => {
  const setupNode = getNodeByKind(node, SyntaxKind.MethodDeclaration);

  if (!setupNode) {
    throw new Error("setup is not found.");
  }

  const blockNode = getNodeByKind(setupNode, SyntaxKind.Block);

  if (!blockNode) {
    throw new Error("setup is not found.");
  }

  const emitsCallExpressions = blockNode
    .forEachDescendantAsArray()
    .filter((x) => x.getKind() === SyntaxKind.CallExpression)
    .filter((x) => x.getFullText().includes("emit")) as CallExpression[];

  const emits = emitsCallExpressions.map((x) => x.getArguments()[0].getText());

  return emits;
};

const isDefineComponent = (node: CallExpression) => {
  if (!Node.isIdentifier(node.getExpression())) {
    return false;
  }

  return node.getExpression().getText() === "defineComponent";
};
