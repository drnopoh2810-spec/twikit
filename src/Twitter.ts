import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// ==================== Types ====================

export interface TwitterConfig {
    proxies?: string;
    language?: string;
    timeout?: number;
    retries?: number;
}

export interface LoginResult {
    success: boolean;
    ct0?: string;
    cookie?: string;
    error?: string;
}

export interface SubtaskResponse {
    flow_token: string;
    subtasks: Array<{ subtask_id: string; [key: string]: unknown }>;
    errors?: Array<{ message: string; code: number }>;
}

interface Subtask {
    subtask_id: string;
    [key: string]: unknown;
}

// ==================== Constants ====================

const TWITTER_API_BASE = 'https://api.twitter.com';
const TWITTER_WEB_BASE = 'https://twitter.com';
const AUTHORIZATION = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const LOGIN_SUBTASK_VERSIONS = {
    action_list: 2, alert_dialog: 1, app_download_cta: 1,
    check_logged_in_account: 1, choice_selection: 3,
    contacts_live_sync_permission_prompt: 0, cta: 7,
    email_verification: 2, end_flow: 1, enter_date: 1,
    enter_email: 2, enter_password: 5, enter_phone: 2,
    enter_recaptcha: 1, enter_text: 5, enter_username: 2,
    generic_urt: 3, in_app_notification: 1, interest_picker: 3,
    js_instrumentation: 1, menu_dialog: 1,
    notifications_permission_prompt: 2, open_account: 2,
    open_home_timeline: 1, open_link: 1, phone_verification: 4,
    privacy_options: 1, security_key: 3, select_avatar: 4,
    select_banner: 2, settings_list: 7, show_code: 1,
    sign_up: 2, sign_up_review: 4, tweet_selection_urt: 1,
    update_users: 1, upload_media: 1, user_recommendations_list: 4,
    user_recommendations_urt: 1, wait_spinner: 3, web_modal: 1,
};

// ==================== Twitter Class ====================

export class Twitter {
    private session: AxiosInstance;
    private flow_token: string | null = null;
    private language: string;
    private timeout: number;
    private retries: number;

    public cookie: string | null = null;
    public ct0: string | null = null;
    public content: SubtaskResponse | null = null;
    public tProxy: HttpsProxyAgent<string> | null = null;

    constructor(config: TwitterConfig = {}) {
        this.language = config.language ?? 'en';
        this.timeout = config.timeout ?? 30000;
        this.retries = config.retries ?? 3;

        if (config.proxies) {
            this.tProxy = new HttpsProxyAgent(config.proxies);
        }

        this.session = axios.create({
            timeout: this.timeout,
            headers: {
                'User-Agent': USER_AGENT,
                'authorization': AUTHORIZATION,
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'Content-Type': 'application/json',
            },
        });

        // Retry interceptor
        this.session.interceptors.response.use(undefined, async (error) => {
            const config = error.config;
            if (!config || !config._retryCount) config._retryCount = 0;
            if (config._retryCount >= this.retries) return Promise.reject(error);
            config._retryCount++;
            await new Promise(r => setTimeout(r, 1000 * config._retryCount));
            return this.session(config);
        });
    }

    // ==================== Private Helpers ====================

    private async getGuestToken(): Promise<string> {
        const response = await this.session.post(
            `${TWITTER_API_BASE}/1.1/guest/activate.json`,
            {},
            { httpAgent: this.tProxy, httpsAgent: this.tProxy }
        );
        if (!response.data?.guest_token) throw new Error('Failed to get guest token');
        return response.data.guest_token;
    }

    private async buildHeaders(): Promise<Record<string, string>> {
        const guestToken = await this.getGuestToken();
        return {
            'x-guest-token': guestToken,
            'x-csrf-token': this.ct0 ?? '',
            'x-twitter-active-user': 'yes',
            'x-twitter-client-language': this.language,
            'Cookie': this.cookie ?? '',
        };
    }

    private extractCookies(setCookieHeader: string[] | undefined): void {
        if (!setCookieHeader?.length) return;
        this.cookie = setCookieHeader.join('; ');
        const ct0Match = setCookieHeader.join('; ').match(/ct0=([^;]+)/);
        if (ct0Match) this.ct0 = ct0Match[1];
    }

    private handleFlowResponse(response: AxiosResponse): void {
        const data: SubtaskResponse = response.data;
        if (data.errors?.length) throw new Error(data.errors[0].message);
        this.flow_token = data.flow_token;
        this.content = data;
        this.extractCookies(response.headers['set-cookie'] as string[]);
    }

    private async postTask(data: unknown, useWebBase = true): Promise<AxiosResponse> {
        const base = useWebBase ? TWITTER_WEB_BASE : TWITTER_API_BASE;
        const headers = await this.buildHeaders();
        return this.session.post(
            `${base}/i/api/1.1/onboarding/task.json`,
            data,
            { headers, httpAgent: this.tProxy, httpsAgent: this.tProxy }
        );
    }

    private assertFlowToken(): void {
        if (!this.flow_token) throw new Error('Flow token not found. Call login_flow() first.');
    }

    // ==================== Public API ====================

    public get_subtask_ids(): string[] {
        return this.content?.subtasks?.map((s: Subtask) => s.subtask_id) ?? [];
    }

    public async login_flow(): Promise<this> {
        const headers = await this.buildHeaders();
        const response = await this.session.post(
            `${TWITTER_API_BASE}/1.1/onboarding/task.json`,
            { input_flow_data: { flow_context: { debug_overrides: {}, start_location: { location: 'manual_link' } } }, subtask_versions: LOGIN_SUBTASK_VERSIONS },
            { headers, params: { flow_name: 'login' }, httpAgent: this.tProxy, httpsAgent: this.tProxy }
        );
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginJsInstrumentationSubtask(): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginJsInstrumentationSubtask',
                js_instrumentation: { response: JSON.stringify({}), link: 'next_link' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginEnterUserIdentifierSSO(user_id: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginEnterUserIdentifierSSO',
                settings_list: {
                    setting_responses: [{ key: 'user_identifier', response_data: { text_data: { result: user_id } } }],
                    link: 'next_link',
                },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginEnterUserIdentifier(user_id: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginEnterUserIdentifier',
                settings_list: {
                    setting_responses: [{ key: 'user_identifier', response_data: { text_data: { result: user_id } } }],
                    link: 'next_link',
                },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async AccountDuplicationCheck(): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'AccountDuplicationCheck',
                check_logged_in_account: { link: 'AccountDuplicationCheck_false' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginEnterAlternateIdentifierSubtask(text: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginEnterAlternateIdentifierSubtask',
                enter_text: { text, link: 'next_link' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginEnterPassword(password: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginEnterPassword',
                enter_password: { password, link: 'next_link' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginTwoFactorAuthChallenge(code: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginTwoFactorAuthChallenge',
                enter_text: { text: code, link: 'next_link' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async LoginAcid(code: string): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'LoginAcid',
                enter_text: { text: code.trim(), link: 'next_link' },
            }],
        });
        this.handleFlowResponse(response);
        return this;
    }

    public async successExit(): Promise<this> {
        this.assertFlowToken();
        const response = await this.postTask({
            flow_token: this.flow_token,
            subtask_inputs: [{
                subtask_id: 'SuccessExit',
                open_link: { link: { link_type: 'subtask', link_id: 'next_link', subtask_id: 'LoginOpenHomeTimeline' } },
            }],
        }, false);
        this.handleFlowResponse(response);
        return this;
    }

    // ==================== High-level Login Helper ====================

    public async login(username: string, password: string, options: {
        email?: string;
        twoFactorCode?: string;
        checkpointCode?: string;
        delayMs?: number;
    } = {}): Promise<LoginResult> {
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        try {
            await delay(options.delayMs ?? 2000);
            await this.login_flow();

            let attempts = 0;
            const maxAttempts = 20;

            while (attempts < maxAttempts) {
                attempts++;
                const subtasks = this.get_subtask_ids();

                if (subtasks.includes('LoginJsInstrumentationSubtask')) {
                    await this.LoginJsInstrumentationSubtask();
                } else if (subtasks.includes('LoginEnterUserIdentifierSSO')) {
                    await this.LoginEnterUserIdentifierSSO(username);
                } else if (subtasks.includes('LoginEnterUserIdentifier')) {
                    await this.LoginEnterUserIdentifier(username);
                } else if (subtasks.includes('LoginEnterPassword')) {
                    await this.LoginEnterPassword(password);
                } else if (subtasks.includes('AccountDuplicationCheck')) {
                    await this.AccountDuplicationCheck();
                } else if (subtasks.includes('LoginEnterAlternateIdentifierSubtask')) {
                    if (!options.email) throw new Error('Email required for alternate identifier step');
                    await this.LoginEnterAlternateIdentifierSubtask(options.email);
                } else if (subtasks.includes('LoginTwoFactorAuthChallenge')) {
                    if (!options.twoFactorCode) throw new Error('2FA code required');
                    await this.LoginTwoFactorAuthChallenge(options.twoFactorCode);
                } else if (subtasks.includes('LoginAcid')) {
                    if (!options.checkpointCode) throw new Error('Checkpoint code required');
                    await this.LoginAcid(options.checkpointCode);
                } else if (subtasks.includes('SuccessExit')) {
                    await this.successExit();
                    return { success: true, ct0: this.ct0 ?? undefined, cookie: this.cookie ?? undefined };
                } else {
                    throw new Error(`Unknown subtask: ${subtasks.join(', ')}`);
                }

                await delay(500);
            }

            throw new Error('Max login attempts reached');
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
}

export default Twitter;
