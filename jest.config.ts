import type { Config } from "jest";
import nextJest from "next/jest.js";

// Next.js 설정(.env, tsconfig 등)을 Jest에서도 쓰게 한다
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  // 기본은 가짜 브라우저 환경 (API 테스트는 파일 맨 위에 @jest-environment node)
  testEnvironment: "jsdom",
  // 테스트마다 먼저 불러올 파일
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // "@/..." 경로를 프로젝트 루트로 연결
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // 테스트 파일은 tests/ 폴더에만 둔다
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
};

export default createJestConfig(config);
