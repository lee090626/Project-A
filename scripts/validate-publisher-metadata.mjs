import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredSitemapPaths = ['/', '/guide', '/changelog', '/privacy', '/terms', '/contact', '/play'];

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

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }

  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }

  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;

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

function findVariableValue(sourceFile, variableName) {
  let foundValue;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      foundValue = expressionToValue(node.initializer);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return foundValue;
}

function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

async function pathExists(relativePath) {
  try {
    await access(path.join(projectRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

const errors = [];
const siteMetadataFile = await parseSourceFile('src/shared/config/siteMetadata.ts');
const defaultSiteUrl = findVariableValue(siteMetadataFile, 'DEFAULT_SITE_URL');

if (typeof defaultSiteUrl !== 'string') {
  errors.push('DEFAULT_SITE_URL must be a string literal.');
} else {
  try {
    const parsedUrl = new URL(defaultSiteUrl);

    if (parsedUrl.protocol !== 'https:') {
      errors.push(`DEFAULT_SITE_URL must use https, got '${defaultSiteUrl}'.`);
    }

    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      errors.push('DEFAULT_SITE_URL must not point to localhost.');
    }

    if (defaultSiteUrl.endsWith('/')) {
      errors.push('DEFAULT_SITE_URL must not include a trailing slash.');
    }
  } catch {
    errors.push(`DEFAULT_SITE_URL is not a valid URL: '${defaultSiteUrl}'.`);
  }
}

const robotsText = await readFile(path.join(projectRoot, 'public/robots.txt'), 'utf8');
const expectedSitemapLine = `Sitemap: ${defaultSiteUrl}/sitemap.xml`;

if (!robotsText.includes('User-agent: *')) {
  errors.push('public/robots.txt must include "User-agent: *".');
}

if (!robotsText.includes('Allow: /')) {
  errors.push('public/robots.txt must include "Allow: /".');
}

if (!robotsText.includes(expectedSitemapLine)) {
  errors.push(`public/robots.txt must include '${expectedSitemapLine}'.`);
}

const sitemapFile = await parseSourceFile('src/app/sitemap.ts');
const sitemapEntries = findVariableValue(sitemapFile, 'SITEMAP_ENTRIES');

if (!Array.isArray(sitemapEntries)) {
  errors.push('SITEMAP_ENTRIES must be a static array literal.');
} else {
  const paths = sitemapEntries.map((entry) => entry?.path).filter(Boolean);
  const duplicatePaths = paths.filter((pathValue, index) => paths.indexOf(pathValue) !== index);

  for (const requiredPath of requiredSitemapPaths) {
    if (!paths.includes(requiredPath)) {
      errors.push(`SITEMAP_ENTRIES is missing '${requiredPath}'.`);
    }
  }

  for (const duplicatePath of new Set(duplicatePaths)) {
    errors.push(`SITEMAP_ENTRIES has duplicate path '${duplicatePath}'.`);
  }

  for (const entry of sitemapEntries) {
    if (!entry || typeof entry.path !== 'string') {
      errors.push('Every sitemap entry must include a string path.');
      continue;
    }

    if (!entry.path.startsWith('/')) {
      errors.push(`Sitemap path '${entry.path}' must start with '/'.`);
    }

    if (!validateDate(entry.lastModified)) {
      errors.push(`Sitemap path '${entry.path}' has invalid lastModified '${entry.lastModified}'.`);
    }

    if (typeof entry.priority !== 'number' || entry.priority < 0 || entry.priority > 1) {
      errors.push(`Sitemap path '${entry.path}' priority must be between 0 and 1.`);
    }
  }
}

for (const routePath of requiredSitemapPaths) {
  const pagePath = routePath === '/' ? 'src/app/page.tsx' : `src/app${routePath}/page.tsx`;

  if (!(await pathExists(pagePath))) {
    errors.push(`Sitemap path '${routePath}' has no matching page file at ${pagePath}.`);
    continue;
  }

  const pageFile = await parseSourceFile(pagePath);
  const metadata = findVariableValue(pageFile, 'metadata');
  const canonicalPath = metadata?.alternates?.canonical;

  if (!metadata || typeof metadata !== 'object') {
    errors.push(`Page '${pagePath}' must export static metadata.`);
  } else if (canonicalPath !== routePath) {
    errors.push(
      `Page '${pagePath}' canonical is '${canonicalPath ?? 'missing'}', expected '${routePath}'.`,
    );
  }
}

if (errors.length > 0) {
  console.error('[validate-publisher-metadata] Publisher metadata validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('[validate-publisher-metadata] Publisher metadata is internally consistent.');
}
