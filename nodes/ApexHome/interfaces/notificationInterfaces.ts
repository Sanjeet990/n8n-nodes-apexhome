export interface NotificationRequestBody {
	appName: string;
	appIcon?: string;
	title: string;
	text?: string;
	html?: string;
	type: string;
	tags: string[];
	actionButton?: {
		actionName: string;
		actionUrl: string;
	};
}