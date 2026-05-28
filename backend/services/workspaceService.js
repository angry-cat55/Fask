const workspaceModel = require('../models/workspaceModel');
const userModel = require('../models/userModel');
const kanbanModel = require('../models/kanbanModel');

// 워크스페이스 생성 비즈니스 로직
exports.createWorkspace = async ({ userId, name, summary_period, auto_task_period }) => {
    // 1. 유저 존재 확인
    const user = await userModel.findUserById(userId);

    if (!user) {
        const error = new Error('존재하지 않는 사용자입니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 워크스페이스 이름 공백 제거
    const trimmedName = name.trim();

    if (trimmedName === '') {
        const error = new Error('워크스페이스 이름을 입력해주세요.');
        error.statusCode = 400;
        throw error;
    }

    // 3. workspaces 테이블에 워크스페이스 생성
    const workspace = await workspaceModel.createWorkspace({
        name: trimmedName,
        summary_period,
        auto_task_period,
    });

    // 4. workspace_members 테이블에 생성자 추가
    await workspaceModel.addWorkspaceMember({
        workspaceId: workspace.workspaceId,
        userId,
        role: 'LEADER',
    });

    // 5. kanbans 테이블에 워크스페이스 칸반 보드 생성
    await kanbanModel.createKanban(workspace.workspaceId);

    // 6. controller로 반환
    return workspace;
};


// 워크스페이스 수정 비즈니스 로직
exports.updateWorkspace = async ({ workspaceId, userId, name, summary_period, auto_task_period }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 요청한 유저가 해당 워크스페이스 멤버인지 확인
    const member = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (!member) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. LEADER 권한 확인
    if (member.role !== 'LEADER') {
        const error = new Error('워크스페이스를 수정할 권한이 없습니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 워크스페이스 이름 공백 제거
    const trimmedName = name.trim();

    if (trimmedName === '') {
        const error = new Error('워크스페이스 이름을 입력해주세요.');
        error.statusCode = 400;
        throw error;
    }

    // 5. 워크스페이스 수정
    await workspaceModel.updateWorkspace({
        workspaceId,
        name: trimmedName,
        summary_period,
        auto_task_period,
    });

    // 6. controller로 반환
    return {
        workspaceId: Number(workspaceId),
        name: trimmedName,
    };
};

// 유저가 참가한 워크스페이스 목록 조회 비즈니스 로직
exports.getWorkspaces = async (userId) => {
    // userId가 존재하는지 확인
    const user = await userModel.findUserById(userId);

    // 사용자가 존재하지 않으면 404 Not Found 에러 발생
    if (!user) {
        const error = new Error('해당 사용자를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 유저가 참가한 워크스페이스 목록 조회
    const workspaces = await workspaceModel.findWorkspacesByUserId(userId);

    // workspaces가 null/undefined일 수 있으므로 안전하게 처리
    if (!workspaces || workspaces.length === 0) {
        return {
            isSuccess: true,
            statusCode: 200,
            data: {
                workspaces: [],
                count: 0,
            },
        };
    }

    return {
        isSuccess: true,
        statusCode: 200,
        data: {
            workspaces: workspaces,
            count: workspaces.length,
        },
    };
}

// 워크스페이스 삭제 비즈니스 로직
exports.deleteWorkspace = async (workspaceId, userId) => {
    // workspaceId로 워크스페이스 조회
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    // 조회된 워크스페이스가 없으면, 404 Not Found 에러 발생
    if (!workspace) {
        return {
            isSuccess: false,
            message: '해당 워크스페이스를 찾을 수 없습니다.',
            statusCode: 404,
        }
    }

    // 워크스페이스의 리더 ID 조회
    const leaderId = await workspaceModel.findWorkspaceLeaderId(workspaceId);

    // 리더 ID가 없으면, 리더가 지정되지 않은 워크스페이스이므로 에러 반환
    if (!leaderId) {
        return {
            isSuccess: false,
            message: '이 워크스페이스에 할당된 리더가 없습니다.',
            statusCode: 400,
        }
    }

    // 요청 사용자(userId)와 리더 ID가 일치하는지 확인
    if (parseInt(userId) !== parseInt(leaderId)) {
        return {
            isSuccess: false,
            message: '워크스페이스를 삭제할 권한이 없습니다.',
            statusCode: 403,
        }
    }

    // 워크스페이스가 존재하고 사용자가 리더이면, 워크스페이스 삭제 수행
    await workspaceModel.deleteWorkspace(workspaceId);

    return {
        isSuccess: true,
        message: '워크스페이스가 성공적으로 삭제되었습니다.',
        statusCode: 200,
    };
};

// 워크스페이스 멤버 초대 비즈니스 로직
exports.inviteMember = async ({ workspaceId, userId, invitedLoginId }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 초대 요청자가 워크스페이스 멤버인지 확인
    const requesterMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (!requesterMember) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. LEADER 권한 확인
    if (requesterMember.role !== 'LEADER') {
        const error = new Error('멤버를 초대할 권한이 없습니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 초대받을 유저 조회
    const invitedUser = await userModel.findUserByLoginId(invitedLoginId.trim());

    if (!invitedUser) {
        const error = new Error('초대할 사용자를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    const invitedUserId = invitedUser.user_id;

    // 5. 자기 자신 초대 방지
    if (Number(userId) === Number(invitedUserId)) {
        const error = new Error('자기 자신은 초대할 수 없습니다.');
        error.statusCode = 400;
        throw error;
    }

    // 6. 이미 워크스페이스 멤버인지 확인
    const alreadyMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: invitedUserId,
    });

    if (alreadyMember) {
        const error = new Error('이미 워크스페이스에 참여 중인 사용자입니다.');
        error.statusCode = 409;
        throw error;
    }

    // 7. 이미 초대가 존재하는지 확인
    const existingInvitation = await workspaceModel.findInvitation({
        workspaceId,
        userId: invitedUserId,
    });
    // 7-1. 이미 PENDING 상태의 초대가 존재하면 에러 반환
    if (existingInvitation && existingInvitation.status === 'PENDING') {
        const error = new Error('이미 초대 요청이 대기 중입니다.');
        error.statusCode = 409;
        throw error;
    }
    // 7-2. 이미 REJECTED 상태의 초대가 존재하면 상태를 PENDING으로 업데이트
    if (existingInvitation && existingInvitation.status === 'REJECTED') {
        await workspaceModel.updateInvitationStatus({
            workspaceId,
            userId: invitedUserId,
            status: 'PENDING',
        });

        return;
    }

    // 8. 초대 생성
    await workspaceModel.createInvitation({
        workspaceId,
        userId: invitedUserId,
        status: 'PENDING',
    });
};

// 초대 수신함 조회 비즈니스 로직
exports.getInvitationInbox = async (userId) => {
    // 1. 유저 존재 확인
    const user = await userModel.findUserById(userId);

    if (!user) {
        const error = new Error('존재하지 않는 사용자입니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 해당 유저가 받은 PENDING 초대 목록 조회
    const invitations = await workspaceModel.findInvitationsByUserId(userId);

    return invitations;
};

// 초대 수락/거절 비즈니스 로직
exports.respondInvitation = async ({ workspaceId, userId, status }) => {
    const normalizedStatus = status.toUpperCase();

    // invitations 테이블 상태값 기준
    if (!['ACCEPTED', 'REJECTED'].includes(normalizedStatus)) {
        const error = new Error('status는 ACCEPTED 또는 REJECTED만 가능합니다.');
        error.statusCode = 400;
        throw error;
    }

    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 초대 존재 확인
    const invitation = await workspaceModel.findInvitation({
        workspaceId,
        userId,
    });

    if (!invitation) {
        const error = new Error('해당 초대를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 3. 이미 처리된 초대인지 확인
    if (invitation.status !== 'PENDING') {
        const error = new Error('이미 처리된 초대입니다.');
        error.statusCode = 409;
        throw error;
    }

    // 4. 거절이면 status만 REJECTED로 변경
    if (normalizedStatus === 'REJECTED') {
        await workspaceModel.updateInvitationStatus({
            workspaceId,
            userId,
            status: 'REJECTED',
        });

        return {
            message: '초대를 거절했습니다.',
        };
    }

    // 5. 수락이면 이미 멤버인지 확인
    const alreadyMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (alreadyMember) {
        const error = new Error('이미 워크스페이스에 참여 중인 사용자입니다.');
        error.statusCode = 409;
        throw error;
    }

    // 6. 초대 상태 ACCEPTED로 변경
    await workspaceModel.updateInvitationStatus({
        workspaceId,
        userId,
        status: 'ACCEPTED',
    });

    // 7. workspace_members에 MEMBER로 추가
    await workspaceModel.addWorkspaceMember({
        workspaceId,
        userId,
        role: 'MEMBER',
    });

    return {
        message: '초대를 수락했습니다.',
    };
};

// 워크스페이스 멤버 강퇴 비즈니스 로직
exports.kickMember = async ({ workspaceId, requestUserId, targetUserId }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 강퇴 요청자가 해당 워크스페이스 멤버인지 확인
    const requestMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: requestUserId,
    });

    if (!requestMember) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. 강퇴 요청자가 LEADER인지 확인
    if (requestMember.role !== 'LEADER') {
        const error = new Error('멤버를 강퇴할 권한이 없습니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 자기 자신 강퇴 방지
    if (Number(requestUserId) === Number(targetUserId)) {
        const error = new Error('자기 자신은 강퇴할 수 없습니다.');
        error.statusCode = 400;
        throw error;
    }

    // 5. 강퇴 대상자가 해당 워크스페이스 멤버인지 확인
    const targetMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: targetUserId,
    });

    if (!targetMember) {
        const error = new Error('강퇴할 멤버를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 6. LEADER 강퇴 방지
    if (targetMember.role === 'LEADER') {
        const error = new Error('LEADER는 강퇴할 수 없습니다.');
        error.statusCode = 403;
        throw error;
    }

    // 7. workspace_members에서 멤버 삭제
    await workspaceModel.deleteWorkspaceMember({
        workspaceId,
        userId: targetUserId,
    });

    // 8. invitation에서 해당 멤버의 초대 기록 삭제 (초대 수락 후 강퇴된 경우를 대비)
    await workspaceModel.deleteInvitation({
         workspaceId,
         userId: targetUserId,
    });

    return {
        message: '멤버 강퇴가 성공적으로 처리되었습니다.',
    };

};


// 워크스페이스 방장 권한 위임 비즈니스 로직
exports.transferWorkspaceLeader = async ({ workspaceId, currentLeaderId, newLeaderId }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 현재 요청자가 해당 워크스페이스 멤버인지 확인
    const currentMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: currentLeaderId,
    });

    if (!currentMember) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. 현재 요청자가 LEADER인지 확인
    if (currentMember.role !== 'LEADER') {
        const error = new Error('방장 권한을 위임할 권한이 없습니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 자기 자신에게 위임 방지
    if (Number(currentLeaderId) === Number(newLeaderId)) {
        const error = new Error('자기 자신에게 방장 권한을 위임할 수 없습니다.');
        error.statusCode = 400;
        throw error;
    }

    // 5. 새 방장이 될 유저가 해당 워크스페이스 멤버인지 확인
    const newLeaderMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: newLeaderId,
    });

    if (!newLeaderMember) {
        const error = new Error('새 방장으로 지정할 사용자가 워크스페이스 멤버가 아닙니다.');
        error.statusCode = 404;
        throw error;
    }

    // 6. 이미 LEADER인 경우 방지
    if (newLeaderMember.role === 'LEADER') {
        const error = new Error('이미 방장인 사용자입니다.');
        error.statusCode = 409;
        throw error;
    }

    // 7. 방장 권한 위임
    await workspaceModel.transferWorkspaceLeader({
        workspaceId,
        currentLeaderId,
        newLeaderId,
    });

    return {
        message: '방장 권한이 성공적으로 위임되었습니다.',
    };
};

// 워크스페이스 멤버 목록 조회 비즈니스 로직
exports.getWorkspaceMembers = async ({ workspaceId, userId }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 요청한 유저가 해당 워크스페이스 멤버인지 확인
    const requester = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (!requester) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. 멤버 목록 조회
    const members = await workspaceModel.findWorkspaceMembers(workspaceId);

    return members;
};