import { getNodeByKind } from "./getNodeByKind";
import {
  Node,
  SourceFile,
  SyntaxKind,
  CallExpression,
  PropertyAssignment,
} from "ts-morph";

export const insertEmitsOption = (sourceFile: SourceFile, template: string) => {
  const callexpression = getNodeByKind(sourceFile, SyntaxKind.CallExpression);

  if (!callexpression) {
    return {
      result: false,
    };
  }

  if (!Node.isCallExpression(callexpression)) {
    return {
      result: false,
    };
  }

  if (!isDefineComponent(callexpression)) {
    return {
      result: false,
    };
  }
  const optionsNode = getNodeByKind(
    callexpression,
    SyntaxKind.ObjectLiteralExpression
  );

  if (!Node.isObjectLiteralExpression(optionsNode)) {
    return {
      result: false,
    };
  }

  const hasEmitsOption = getOptionsNode(callexpression, "emits");

  if (hasEmitsOption) {
    return {
      result: false,
    };
  }

  const scriptEmits = convertToEmits(callexpression);

  const templateEmits = convertToEmitsFromTemplate(template);

  if (scriptEmits.length === 0 && templateEmits.length === 0) {
    return {
      result: false,
    };
  }

  const emits = [...new Set([...scriptEmits, ...templateEmits])];

  optionsNode.addProperty(`emits: [${emits.join(",")}]`);

  return {
    result: true,
    emits,
  };
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

export const getOptionsNode = (node: CallExpression, type: "emits") => {
  const expression = getNodeByKind(node, SyntaxKind.ObjectLiteralExpression);

  if (!expression) {
    throw new Error("props is not found.");
  }
  if (!Node.isObjectLiteralExpression(expression)) {
    throw new Error("props is not found.");
  }

  const properties = expression
    .getProperties()
    .filter((x) => x.getKind() === SyntaxKind.PropertyAssignment);

  const propsNode = properties.find((x) => {
    const identifiler = (x as PropertyAssignment).getName();
    return identifiler === type;
  });

  if (!propsNode) {
    return;
  }

  return propsNode as PropertyAssignment;
};

const convertToEmitsFromTemplate = (src: string) => {
  const match = [...src.matchAll(/\$emit\((.*).*\)/g)];

  if (match) {
    return match.map((x) => x[1]);
  }

  return "";
};
