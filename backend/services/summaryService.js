const aiService = require('./aiService');
const summaryModel = require('../models/summaryModel');
const chatModel = require('../models/chatModel');
const workspaceModel = require('../models/workspaceModel');

const executeWorkspaceSummary = async (workspaceId, userId) => {
    // 유저가 워크스페이스 멤버인지 확인
    const isMember = await workspaceModel.findWorkspaceMember({ workspaceId, userId });
    if (!isMember) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 요약 메세지의 createdAt 이후에 생성된 새 메시지 리스트 조회 (메세지ID, 로그인아이디, 닉네임, 내용, 전송일자)
    const newMessages = await chatModel.getNewMessagesAfterSummary(workspaceId);

    // DB에서 최신 요약 조회 (summaryId, workspaceId, summaryContent, startMessageId, endMessageId, createdAt)
    const lastSummary = await summaryModel.getLatestSummary(workspaceId);

    // 새 메시지가 없으면 기존 요약 유지
    if (!newMessages || newMessages.length === 0) {
        return {
            statusCode: 200,
            message: '새 메시지가 없어 기존 요약을 유지합니다.',
            data: lastSummary ? lastSummary.summaryContent : '생성된 요약이 없습니다.', // 이전 요약이 없을 때 처리
        }
    }

    // 새 메시지 포맷팅 (예: [닉네임(로그인아이디)](날짜): 메시지 내용)
    const formattedMessages = newMessages.map(msg => `[${msg.nickname}(${msg.loginId})](${msg.createdAt}): ${msg.content}`).join('\n');

    // 요약 서비스 전용 프롬프트
    const systemPrompt = `
    너는 협업 플랫폼의 전문 요약 비서야.
    입력으로는 [이전 요약 내용]과 [새 메시지]가 주어지고, 너의 임무는 새로 추가된 메시지를 중심으로 대화방의 최신 상태를 읽기 쉽게 요약하는 것이야.

    반드시 지켜야 할 규칙:
    1. [이전 요약 내용]은 참고용 맥락일 뿐이며, 억지로 새 메시지와 융합하거나 반복하지 마.
    2. 같은 내용이 이전 요약에 이미 충분히 포함되어 있고 새 메시지에서 추가된 정보가 없다면, 해당 내용을 불필요하게 반복하지 마.
    3. 새 메시지에 없는 내용은 추측하거나 만들어내지 마.
    4. 이전 요약과 새 메시지가 충돌하면, 새 메시지를 우선해.
    5. 요약은 대화방에서 빠르게 맥락을 파악할 수 있도록 한국어 마크다운 형식으로 작성해.
    6. 메시지 양이 적거나 내용이 단순하면, 굳이 길게 늘리지 말고 그 분량에 맞게 짧고 정확하게 요약해.
    7. 중요한 결정사항, 요청사항, 진행상황, 미해결 이슈가 있으면 우선적으로 드러내.
    8. 특정 인물의 발언은 필요할 때만 간단히 언급하고, 불필요한 닉네임 반복은 피하되 누가 말했는지는 문맥상 구분되면 반영해.
    9. 원문을 그대로 길게 복사하지 말고, 의미만 간결하게 정리해.
    10. 메시지에 표시된 닉네임 또는 로그인 아이디가 '알 수 없음'인 경우, 이는 원래 작성자가 채팅방을 나가 현재 사용자 정보를 확인할 수 없는 상태를 의미한다.
    11. '알 수 없음'을 실제 사용자 이름이나 로그인 아이디로 취급하지 마라.
    12. 여러 개의 '알 수 없음' 메시지가 있더라도 동일 인물이라고 단정하지 마라.
    13. 필요하다면 '채팅방을 나간 참여자' 또는 '퇴장한 참여자'로 표현할 수 있다.
    14. 출력은 설명 없이 요약본만 제공해.
    `;

    // 유저 프롬프트 구성
    const userPrompt = `
    [이전 요약 내용]
    ${lastSummary ? lastSummary.summaryContent : '이전 요약 내역 없음'}

    [새 메시지]
    ${formattedMessages}

    요약 작성 기준:
    - 대화의 핵심 흐름을 빠르게 파악할 수 있어야 함
    - 이전 요약은 배경으로만 활용하고, 새 메시지 중심으로 최신화할 것
    - 내용이 적으면 짧게, 많으면 적절히 구조화해서 정리할 것
    - 불필요한 장황함 없이 가독성 좋은 마크다운으로 작성할 것
    `;

    // 공통 AI 도구(aiService) 호출 및 반환 (요약 텍스트만)
    const newSummary = await aiService.callTextModel(systemPrompt, userPrompt);

    // DB에 결과 저장
    const savedSummary = await summaryModel.saveSummary({ workspaceId, summaryContent: newSummary, startMessageId: newMessages[0].messageId, endMessageId: newMessages[newMessages.length - 1].messageId });

    // 결과 반환 (summaryId, workspaceId, summaryContent, startMessageId, endMessageId, createdAt)
    return {
        statusCode: 200,
        message: '대화 내용 수동 요약을 성공했습니다.',
        data: savedSummary,
    };
};

module.exports = { executeWorkspaceSummary };