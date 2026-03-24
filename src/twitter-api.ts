import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// ==================== Twitter API Client ====================

export class TwitterApiClient {
    private session: AxiosInstance;
    private cookie: string;
    private ct0: string;

    constructor(cookie: string, ct0: string) {
        this.cookie = cookie;
        this.ct0 = ct0;

        this.session = axios.create({
            baseURL: 'https://twitter.com',
            headers: {
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'cookie': this.cookie,
                'x-csrf-token': this.ct0,
                'x-twitter-active-user': 'yes',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-client-language': 'en',
                'content-type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': 'https://twitter.com/',
                'Origin': 'https://twitter.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
        });
    }

    // ==================== Tweet Operations ====================

    async postTweetV2(text: string, mediaIds?: string[]): Promise<any> {
        // Use the internal Twitter API endpoint
        const payload: any = {
            variables: {
                tweet_text: text,
                dark_request: false,
                media: mediaIds && mediaIds.length > 0 ? {
                    media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
                    possibly_sensitive: false
                } : undefined,
                semantic_annotation_ids: [],
                disallowed_reply_options: null
            },
            features: {
                communities_web_enable_tweet_community_results_fetch: true,
                c9s_tweet_anatomy_moderator_badge_enabled: true,
                responsive_web_edit_tweet_api_enabled: true,
                graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
                view_counts_everywhere_api_enabled: true,
                longform_notetweets_consumption_enabled: true,
                responsive_web_twitter_article_tweet_consumption_enabled: true,
                tweet_awards_web_tipping_enabled: false,
                creator_subscriptions_quote_tweet_preview_enabled: false,
                longform_notetweets_rich_text_read_enabled: true,
                longform_notetweets_inline_media_enabled: true,
                articles_preview_enabled: true,
                rweb_video_timestamps_enabled: true,
                rweb_tipjar_consumption_enabled: true,
                responsive_web_graphql_exclude_directive_enabled: true,
                verified_phone_label_enabled: false,
                freedom_of_speech_not_reach_fetch_enabled: true,
                standardized_nudges_misinfo: true,
                tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
                responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
                responsive_web_graphql_timeline_navigation_enabled: true,
                responsive_web_enhance_cards_enabled: false
            },
            queryId: 'SoVnbfCycZ7fERGCwpZkYA'
        };

        try {
            const response = await this.session.post(
                '/i/api/graphql/SoVnbfCycZ7fERGCwpZkYA/CreateTweet',
                payload
            );
            return response.data;
        } catch (error: any) {
            // Fallback to v1.1 API
            if (error.response?.status === 404) {
                return await this.postTweetV1(text, mediaIds);
            }
            throw error;
        }
    }

    async postTweetV1(text: string, mediaIds?: string[]): Promise<any> {
        const params: any = { status: text };
        
        if (mediaIds && mediaIds.length > 0) {
            params.media_ids = mediaIds.join(',');
        }

        const response = await this.session.post(
            '/i/api/1.1/statuses/update.json',
            null,
            { params }
        );
        return response.data;
    }

    async postTweet(text: string): Promise<any> {
        return this.postTweetV1(text);
    }

    // ==================== Media Upload ====================

    async uploadMedia(filePath: string, mediaType: 'image' | 'video' | 'gif'): Promise<string> {
        const fileBuffer = fs.readFileSync(filePath);
        const fileSize = fileBuffer.length;

        // INIT
        const initResponse = await this.session.post(
            'https://upload.twitter.com/i/media/upload.json',
            null,
            {
                params: {
                    command: 'INIT',
                    total_bytes: fileSize,
                    media_type: this.getMediaMimeType(mediaType),
                    media_category: mediaType === 'gif' ? 'tweet_gif' : `tweet_${mediaType}`,
                },
                headers: {
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'cookie': this.cookie,
                    'x-csrf-token': this.ct0,
                }
            }
        );

        const mediaId = initResponse.data.media_id_string;

        // APPEND
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        let segmentIndex = 0;

        for (let i = 0; i < fileSize; i += chunkSize) {
            const chunk = fileBuffer.slice(i, Math.min(i + chunkSize, fileSize));
            const formData = new FormData();
            formData.append('command', 'APPEND');
            formData.append('media_id', mediaId);
            formData.append('segment_index', segmentIndex.toString());
            formData.append('media', chunk);

            await axios.post('https://upload.twitter.com/i/media/upload.json', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'cookie': this.cookie,
                    'x-csrf-token': this.ct0,
                },
            });

            segmentIndex++;
        }

        // FINALIZE
        await this.session.post('https://upload.twitter.com/i/media/upload.json', null, {
            params: {
                command: 'FINALIZE',
                media_id: mediaId,
            },
            headers: {
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'cookie': this.cookie,
                'x-csrf-token': this.ct0,
            }
        });

        // Wait for processing (for videos)
        if (mediaType === 'video') {
            await this.waitForMediaProcessing(mediaId);
        }

        return mediaId;
    }

    private async waitForMediaProcessing(mediaId: string, maxAttempts = 30): Promise<void> {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await axios.get('https://upload.twitter.com/i/media/upload.json', {
                params: {
                    command: 'STATUS',
                    media_id: mediaId,
                },
                headers: {
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'cookie': this.cookie,
                    'x-csrf-token': this.ct0,
                }
            });

            const state = response.data.processing_info?.state;
            if (state === 'succeeded') return;
            if (state === 'failed') throw new Error('Media processing failed');

            await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error('Media processing timeout');
    }

    private getMediaMimeType(mediaType: 'image' | 'video' | 'gif'): string {
        switch (mediaType) {
            case 'image': return 'image/jpeg';
            case 'video': return 'video/mp4';
            case 'gif': return 'image/gif';
        }
    }

    // ==================== Live Streaming ====================

    async createBroadcast(title: string): Promise<any> {
        // Note: Twitter's live streaming API (Periscope) requires special access
        // This is a placeholder for the structure
        const response = await this.session.post('/1.1/broadcasts/create.json', {
            title,
            status: 'NOT_STARTED',
        });
        return response.data;
    }

    // ==================== User Info ====================

    async getMe(): Promise<any> {
        const response = await this.session.get('/i/api/1.1/account/verify_credentials.json', {
            params: {
                include_entities: false,
                skip_status: true,
                include_email: false
            }
        });
        return response.data;
    }
}
