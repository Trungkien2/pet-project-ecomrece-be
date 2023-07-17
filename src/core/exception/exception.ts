import { HttpStatus } from '@nestjs/common';

export const EXCEPTION = {
  OVERRATED: {
    message: {
      en: 'Overused choice.',
      ko: '남용된 선택.',
    },
    httpCode: HttpStatus.MISDIRECTED,
    statusCode: HttpStatus.MISDIRECTED,
    type: 'overused_choice',
  },

  // DEFUALT DATABASE
  RECORD_NOT_FOUND: {
    message: {
      en: 'Record Not Found.',
      ko: '해당 기록이 없습니다.',
    },
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'not_found',
  },

  HASHTAG_DUPLICATE: {
    message: {
      en: 'Hashtag duplicate.',
      ko: '중복된 태그입니다. 다른 태그를 입력해 주세요.',
    },
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'duplicate_hashtag',
  },

  // DEFAULT AUTH
  UNAUTHORIZED: {
    message: {
      en: 'Unauthorized.',
      ko: '허가받지 않은.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'Unauthorized',
  },
  YOU_NOT_PERMISSIONS: {
    message: {
      en: 'You are not permissions.',
      ko: '접근 권한이 없습니다.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'permission_deny',
  },
  TOKEN_EXPIRED: {
    message: {
      en: 'Token Expired.',
      ko: '토큰이 만료되었습니다.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'token_expired',
  },
  USER_BLOCK: {
    message: {
      en: 'User Blocked.',
      ko: '본 계정이 차단되었습니다. teamscare123@gmail.com 으로 관리자와 연락해주시기 바랍니다.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'user_blocked',
  },
  BAD_TOKEN: {
    message: {
      en: 'Bad Token.',
      ko: '나쁜 토큰.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'bad_token',
  },

  // DEFUALT ROUTER
  SORRY_SOMETHING_WENT_WRONG: {
    message: {
      en: 'Sorry! Something went wrong.',
      ko: '에러. 문제가 발생했습니다.',
    },
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'something_went_wrong',
  },
  THE_API_NOT_SUPPORTED: {
    message: {
      en: 'The API is not supported.',
      ko: 'API 지원하지 않습니다.',
    },
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'api_not_supported',
  },
  BAD_REQUEST: {
    message: {
      en: 'Bad Request.',
      ko: '잘못된 요청입니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'bad_request',
  },

  // USER
  USERNAME_ALREADY_REGISTERED: {
    message: {
      en: 'Username already registered.',
      ko: '이미 가입된 이메일입니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'username_registered',
  },
  ACCOUNT_HAS_BEEN_DELETED: {
    message: {
      en: 'This account has been deleted. Check back with your manager.',
      ko: '본 계정이 삭제되었습니다. 관리자와 다시 확인하세요.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'accout_not_existed',
  },
  ACCOUNT_HAS_BEEN_BLOCKED: {
    message: {
      en: 'This account has been blocked.',
      ko: '이 계정이 차단되었습니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_blocked',
  },
  ACCOUNT_DOES_NOT_EXIST: {
    message: {
      en: 'Account does not exist.',
      ko: '회원 정보가 없습니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'accout_not_existed',
  },
  PASSWORD_ALREADY_EXISTS: {
    message: {
      en: 'Please enter a new password that is different from the old password.', //cần dịch
      ko: '이전 비밀번호와 다른 새 비밀번호를 입력하세요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'password_already_exists',
  },
  PASSWORD_IS_NOT_CORRECT: {
    message: {
      en: 'Current password is not correct.',
      ko: '비밀번호를 틀렸습니다. 다시 입력해 주세요.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'password_is_not_correct',
  },
  EMAIL_DOSE_NOT_EXIST: {
    message: {
      en: 'Email dose not exist.',
      ko: '이메일 용량이 존재하지 않습니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'Email_dose_not_exist',
  },
  PHONE_NUMBER_ALREADY_EXIST: {
    message: {
      en: 'Phone number already exist.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'phone_number_already_exists',
  },
  EMAIL_OR_PASSWORD_IS_INCORRECT: {
    message: {
      en: 'Email or password is incorrect.',
      ko: '이메일 또는 비밀번호가 올바르지 않습니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'email_or_password_is_incorrect',
  },
  EMAIL_ALREADY_REGISTERED: {
    message: {
      en: 'Email already registered.',
      ko: '이미 등록된 이메일.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'email_registered',
  },
  NAME_ALREADY_REGISTERED: {
    message: {
      en: 'Name already registered.',
      ko: '이미 등록된 이메일.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'name_register',
  },
  PHONE_ALREADY_REGISTERED: {
    message: {
      en: 'Phone already registered',
      ko: '이미 등록된 이메일.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'phone_registered',
  },
  DELETE_ACCOUNT: {
    message: {
      en: 'Account has been deleted.',
      ko: '계정이 삭제되었습니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'delete_account',
  },

  NOT_ENOUGH_MONEY: {
    message: {
      en: "You don't enough money.",
      ko: '당신은 돈이 충분하지 않습니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'not_enough_money',
  },

  //EMPLOYEE
  ADMIN_EMAIL_DOSE_NOT_EXIST: {
    message: {
      en: 'Email dose not exist.',
      ko: '입력하신 정보와 일치하는 계정이 없습니다. 관리자에게 문의해 주세요.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'Email_dose_not_exist',
  },

  ADMIN_PASSWORD_IS_NOT_CORRECT: {
    message: {
      en: 'Current password is not correct.',
      ko: '비밀번호를 틀렸습니다. 다시 입력해 주세요.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'password_is_not_correct',
  },

  LEAST_ONE_EXISTED_VOICE: {
    message: {
      en: 'Least one existed voice.',
      ko: '최소한 하나의 존재하는 목소리.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'least_on_existed_voice',
  },
  USER_NOT_FOUND: {
    message: {
      en: 'User not found.',
      ko: '사용자를 찾을 수 없음.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_not_found',
  },

  NAME_CLUB_ALREADY_REGISTERED: {
    message: {
      en: 'Name already registered.',
      ko: '이미 등록된 이름입니다.', //can dich
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'name_registered',
  },

  MEMBER_CLUB_ALREADY_JOINED: {
    message: {
      en: 'Member already joined.',
      ko: '이미 가입한 회원.', //can dich
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'member_joined',
  },

  MEMBER_NOT_FOUND: {
    message: {
      en: 'Member not found.',
      ko: '이미 가입한 회원.', //can dich
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'member_not_found',
  },
  PHONE_BEING_APPRAISAL: {
    message: {
      en: 'Phone number is being verified.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'phone_number_being_verified',
  },
  IMAGE_APPRAISAL_ALREADY_EXIST: {
    message: {
      en: 'Image appraisal is already existed.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'image_appraisal_already_existed',
  },
  ALREADY_TWO_SUBADMIN: {
    message: {
      en: 'Club already have two subadmin.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'club_already_have_two_subadmin',
  },
  REFERRAL_CODE_NOT_EXIST: {
    message: {
      en: 'Referral code is not exist.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'referral_not_exist',
  },
  MAXIMUM_THREE_CLUB: {
    message: {
      en: 'each person has maximum three club',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'each_people_has_maximum_three_club',
  },
  USER_HAS_NOT_REVIEW_DATE: {
    message: {
      en: 'User has not review date',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_has_not_review_date',
  },
  NOT_DELETE_MYSElF: {
    message: {
      en: 'You do not delete yourself',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'you_do_not_delete_yourself',
  },
  MEMBER_ALREADY_JOINED: {
    message: {
      en: 'Member is already joined club',
      ko: '해당 유저가 클럽에 참가했어요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'member_already_joined_club',
  },
  USER_ALREADY_SUSPENDED_APP: {
    message: {
      en: 'User is already suspended app',
      ko: '해당 유저가 클럽에 참가했어요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_already_suspend_app',
  },
  USER_ALREADY_SUSPENDED_CLUB: {
    message: {
      en: 'User is already suspended club',
      ko: '해당 유저가 클럽에 참가했어요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_already_suspend_club',
  },
  USER_ALREADY_SUSPENDED_PARTY: {
    message: {
      en: 'User is already suspended party',
      ko: '해당 유저가 클럽에 참가했어요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_already_suspend_party',
  },
  USER_ALREADY_SUSPENDED_LOUNGE: {
    message: {
      en: 'User is already suspended lounge',
      ko: '해당 유저가 클럽에 참가했어요.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_already_suspend_lounge',
  },
  EMAIL_IN_BLACK_LIST: {
    message: {
      en: 'Email is exist in black list',
      ko: '블랙리스트에 오른 이메일',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'email_in_black_list',
  },
  MEMBER_IN_STATE_WAITING: {
    message: {
      en: 'Member is already in state waiting',
      ko: '블랙리스트에 오른 이메일',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'Member_in_state_waiting',
  },
  USER_MUST_HAS_ONE_BADGET: {
    message: {
      en: 'User must has one badget',
      ko: '블랙리스트에 오른 이메일',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'user_must_has_one_badget',
  },
  USER_MUST_LEAVE_CLUB: {
    message: {
      en: 'User must leave club',
      ko: '',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'user_must_leave_club',
  },
  USER_NOT_YET_APPROVED_IMAGE: {
    message: {
      en: 'There is a user who has not yet approved the photo',
      ko: '프로필 사진을 먼저 확인하세요.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'user_not_yet_approved_image',
  },
  CLUB_FULL_MEMBER: {
    message: {
      en: 'Club is already full of member',
      ko: '프로필 사진을 먼저 확인하세요.',
    },
    httpCode: HttpStatus.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'club_full_member',
  },
  ACCOUNT_ADMIN_DELETED: {
    message: {
      en: 'Admin is deleted.',
      ko: '회원 정보가 없습니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'admin_deleted',
  },
  ALREADY_PROVIDED_CREDIT_NEW_USER: {
    message: {
      en: 'New user is already provided credit',
      ko: '회원 정보가 없습니다.',
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'already_provided_credit',
  },
  USER_ALREADY_REPORTED: {
    message: {
      en: 'User already reported.',
      ko: '전화번호가 이미 존재합니다.', //cần dịch
    },
    httpCode: HttpStatus.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'user_already_reported',
  },
};
