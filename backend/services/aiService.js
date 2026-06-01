const { generateText, generateObject } = require('ai');
const { google } = require('@ai-sdk/google');

// 텍스트 생성용 AI 함수 (대화 내용 요약 등에 사용)
const callTextModel = async (systemPrompt, userPrompt) => {
    try {
        const { text } = await generateText({
            model: google('gemini-3.1-flash-lite'),
            system: systemPrompt, // summaryService에서 전달받은 시스템 프롬프트
            prompt: userPrompt, // summaryService에서 전달받은 유저 프롬프트 (대화 내용 등)
        });
        return text;
    } catch (error) {
        console.error('AI Text API 호출 에러:', error);

        const wrappedError = new Error('대화 요약 텍스트 생성에 실패했습니다.');
        wrappedError.statusCode = 500;
        throw wrappedError;
    }
};

// TODO: 칸반 수동/자동 생성 구현할 때 사용할 것
// JSON 생성용 AI 함수 (칸반 수동/자동 생성 등에 사용)
const callJsonModel = async (userPrompt, schemaDefinition) => {
    try {
        const { object } = await generateObject({
            model: google('gemini-3.1-flash-lite'),
            prompt: userPrompt, // autoKanbanService에서 전달받은 유저 프롬프트 (칸반 데이터, 대화 내용 등)
            schema: schemaDefinition, // autoKanbanService에서 전달받은 Zod 스키마 (응답 데이터 구조 정의)
        });
        return object;
    } catch (error) {
        console.error('AI JSON API 호출 에러:', error);

        const wrappedError = new Error('자동 칸반 데이터 생성에 실패했습니다.');
        wrappedError.statusCode = 500;
        throw wrappedError;
    }
};

module.exports = { callTextModel, callJsonModel };