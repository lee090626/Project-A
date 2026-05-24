import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playableCircleIds = new Set([2, 3, 4]);
const layerDepthStep = 100;

function unwrapExpression(node) {
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    return unwrapExpression(node.expression);
  }

  return node;
}

function propertyNameToString(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

function expressionToValue(node) {
  const expression = unwrapExpression(node);

  if (ts.isStringLiteral(expression) || ts.isNumericLiteral(expression)) {
    return expression.text;
  }

  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isPrefixUnaryExpression(expression)) {
    const value = expressionToValue(expression.operand);
    if (typeof value !== 'string') return undefined;
    const numericValue = Number(value);

    if (expression.operator === ts.SyntaxKind.MinusToken) return -numericValue;
    if (expression.operator === ts.SyntaxKind.PlusToken) return numericValue;
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.map(expressionToValue);
  }

  if (ts.isObjectLiteralExpression(expression)) {
    const value = {};

    for (const property of expression.properties) {
      if (!ts.isPropertyAssignment(property)) continue;

      const key = propertyNameToString(property.name);
      if (!key) continue;

      value[key] = expressionToValue(property.initializer);
    }

    return value;
  }

  return undefined;
}

async function parseSourceFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const source = await readFile(absolutePath, 'utf8');

  return ts.createSourceFile(absolutePath, source, ts.ScriptTarget.Latest, true);
}

function findArrayDeclaration(sourceFile, variableName) {
  let foundArray = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);
      if (ts.isArrayLiteralExpression(initializer)) {
        foundArray = expressionToValue(initializer);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return foundArray;
}

function findAllArrayDeclarations(sourceFile) {
  const arrays = [];

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const initializer = unwrapExpression(node.initializer);
      if (ts.isArrayLiteralExpression(initializer)) {
        arrays.push(expressionToValue(initializer));
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return arrays;
}

async function loadCircles() {
  const sourceFile = await parseSourceFile('src/shared/config/circleData.ts');
  const circles = findArrayDeclaration(sourceFile, 'CIRCLES');

  if (!Array.isArray(circles)) {
    throw new Error('Unable to parse CIRCLES from src/shared/config/circleData.ts');
  }

  return circles.filter((circle) => playableCircleIds.has(Number(circle.id)));
}

async function loadMineralDefinitions() {
  const mineralsDir = path.join(projectRoot, 'src/shared/config/minerals');
  const fileNames = await readdir(mineralsDir);
  const definitions = new Map();

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.ts') || fileName === 'types.ts') continue;

    const sourceFile = await parseSourceFile(`src/shared/config/minerals/${fileName}`);
    const arrays = findAllArrayDeclarations(sourceFile);

    for (const array of arrays) {
      if (!Array.isArray(array)) continue;

      for (const definition of array) {
        if (!definition || typeof definition.key !== 'string') continue;
        definitions.set(definition.key, definition);
      }
    }
  }

  return definitions;
}

function validateDepths(circles, definitions) {
  const errors = [];

  for (const circle of circles) {
    const circleId = Number(circle.id);
    const depthStart = Number(circle.depthStart);
    const bgDefinition = definitions.get(circle.bgType);

    if (!bgDefinition) {
      errors.push(`C${circleId} background tile '${circle.bgType}' is missing a mineral definition.`);
    } else if (Number(bgDefinition.minDepth) !== depthStart) {
      errors.push(
        `C${circleId} background '${circle.bgType}' minDepth is ${bgDefinition.minDepth}, expected ${depthStart}.`,
      );
    }

    for (const mineralRule of circle.minerals ?? []) {
      const mineralDefinition = definitions.get(mineralRule.type);
      const minLayer = Number(mineralRule.minLayer ?? 1);
      const expectedDepth = depthStart + (minLayer - 1) * layerDepthStep;

      if (!mineralDefinition) {
        errors.push(`C${circleId} mineral '${mineralRule.type}' is missing a mineral definition.`);
        continue;
      }

      if (Number(mineralDefinition.minDepth) !== expectedDepth) {
        errors.push(
          `C${circleId} mineral '${mineralRule.type}' minDepth is ${mineralDefinition.minDepth}, expected ${expectedDepth} from minLayer ${minLayer}.`,
        );
      }
    }
  }

  return errors;
}

const circles = await loadCircles();
const definitions = await loadMineralDefinitions();
const errors = validateDepths(circles, definitions);

if (errors.length > 0) {
  console.error('[validate-mineral-depths] Mineral depth validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('[validate-mineral-depths] C2-C4 mineral depth metadata matches circle rules.');
}
