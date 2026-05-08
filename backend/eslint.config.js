// ESLint 기본 JavaScript 추천 규칙
import js from '@eslint/js'

// Node.js 전역 객체(process, console 등) 사용 허용
import globals from 'globals'

// ESLint 최신 Flat Config 방식 사용
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist 폴더는 검사 대상에서 제외
  globalIgnores(['dist']),

  {
    // 모든 js, mjs 파일 검사
    files: ['**/*.{js,mjs}'],

    // ESLint 기본 추천 규칙 적용
    extends: [js.configs.recommended],

    languageOptions: {
      // 최신 JavaScript 문법 사용 허용
      ecmaVersion: 'latest',

      // import/export 문법 사용
      sourceType: 'module',

      // Node.js 전역 변수 사용 허용
      globals: globals.nodeBuiltin,
    },

    rules: {
      // 사용하지 않는 변수는 에러 처리
      // 단, _ 로 시작하는 매개변수는 무시
      // 예: (_req, res)
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
])