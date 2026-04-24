/**
 * 주어진 문자열을 PascalCase로 변환합니다.
 * - `snake_case`, `kebab-case`, 공백 구분 문자열을 모두 지원합니다.
 * - 이미 혼합 대소문자인 경우에도 단어 경계를 보존하지 않고 단어 단위로 정규화합니다.
 *
 * @param value 변환할 원본 문자열
 * @returns PascalCase로 변환된 문자열
 */
export const toPascalCase = (value: string): string => {
  if (!value) return '';

  return value
    .split(/[_\-\s]+/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join('');
};

