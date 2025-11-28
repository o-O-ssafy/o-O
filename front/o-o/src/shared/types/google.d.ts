// Google One Tap 관련 타입 정의

// window 안에 google 객체가 존재함을 알림
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (
            momentListener?: (notification: PromptMomentNotification) => void
          ) => void;
          cancel: () => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleRenderButtonOptions
          ) => void;
        };
      };
    };
  }
  var google: Window["google"];

  // google.accounts.id.initialize에 전달되는 설정 객체 타입
  interface GoogleOneTapConfig {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    prompt_parent_id?: string;
    nonce?: string;
    context?: "signin" | "signup" | "use";
    state_cookie_domain?: string;
    ux_mode?: "popup" | "redirect";
    allowed_parent_origin?: string | string[];
    intermediate_iframe_close_callback?: () => void;
  }

  // 로그인 성공 시 콜백으로 전달되는 응답 데이터 타입
  interface CredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
  }

  // One Tap UI가 뜨거나 닫힐 때의 상태를 알려주는 콜백 타입
  interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () =>
      | "browser_not_supported"
      | "invalid_client"
      | "missing_client_id"
      | "opt_out_or_no_session"
      | "secure_http_required"
      | "suppressed_by_user"
      | "unregistered_origin"
      | "unknown_reason";
    isSkippedMoment: () => boolean;
    getSkippedReason: () =>
      | "auto_cancel"
      | "user_cancel"
      | "tap_outside"
      | "issuing_failed";
    isDismissedMoment: () => boolean;
    getDismissedReason: () =>
      | "credential_returned"
      | "cancel_called"
      | "flow_restarted";
    getMomentType: () => "display" | "skipped" | "dismissed";
  }
}

export {};
